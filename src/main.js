var FOV = 45;
var NEAR = 1;
var FAR = 5000;

var sceneMetadata;
var scene, renderer;
var mesh, geometry, material;
var div;
var ready;
var jsonLoader;
var keyMap;

var MOVEMENT_PER_FRAME = 0.1;
var ROTATION_PER_FRAME = 0.01;

/* Amount of radians to rotate when the mouse is moved from one extreme along
an axis to the other. */
var MOUSE_SENSITIVITY = 3.14;

var lastPageX = 0;
var lastPageY = 0;

var is_animation_running;
var prev_key_frame;
var prev_position;
var next_position;
var prev_rotation;
var next_rotation;

function resetCamera()
{
    var eye = sceneMetadata.fields.eye.split(",");
    var eyeVec = new THREE.Vector3(
        parseFloat(eye[0]),
        parseFloat(eye[1]),
        parseFloat(eye[2])
    );
    camera.position = eyeVec;

    var up = sceneMetadata.fields.up.split(",");
    var upVec = new THREE.Vector3(
        parseFloat(up[0]),
        parseFloat(up[1]),
        parseFloat(up[2])
    );

    var at = sceneMetadata.fields.at.split(",");
    var atVec = new THREE.Vector3(
        parseFloat(at[0]),
        parseFloat(at[1]),
        parseFloat(at[2])
    );

    var lookAt = new THREE.Matrix4();
    lookAt = lookAt.lookAt(eyeVec, atVec, upVec);

    camera.quaternion.setFromRotationMatrix(lookAt);
}

function loadMesh(pk)
{
    reset();

    $.ajax({url: '/shady/scenes/get/' + pk + '/',
        async: false})
        .done(function(result) {
            sceneMetadata = $.parseJSON(result)[0];
            resetCamera();

            var url = sceneMetadata.fields["url"] + "/mesh.js";
            jsonLoader.load(url, onMeshLoaded);
            logger.info("Loading mesh at '" + url + "'...");
        });
}

function onKeyUp(ev)
{
    keyMap[ev.keyCode] = false;
}

function startAnimation(keyFrames)
{
    keyFrames = $.parseJSON(keyFrames);

    position = $.parseJSON(keyFrames[0].fields.position);
    camera.position.x = position.x;
    camera.position.y = position.y;
    camera.position.z = position.z;

    rotation = $.parseJSON(keyFrames[0].fields.rotation);
    camera.quaternion._x = rotation._x;
    camera.quaternion._y = rotation._y;
    camera.quaternion._z = rotation._z;

    prev_position = camera.position;
    next_position = $.parseJSON(keyFrames[1].fields.position);
    next_position = new THREE.Vector3(next_position.x, next_position.y,
        next_position.z);

    prev_rotation = camera.quaternion;
    next_rotation = $.parseJSON(keyFrames[1].fields.rotation);
    next_rotation = new THREE.Quaternion(next_rotation._x, next_rotation._y,
        next_rotation._z, next_rotation._w);

    is_animation_running = true;
    prev_key_frame = new Date().getTime();
}

function animate()
{
    var now = new Date().getTime();

    var delta = (now - prev_key_frame) / 5000;

    var direction = new THREE.Vector3();
    direction.subVectors(next_position, prev_position);
    direction.multiplyScalar(delta);
    camera.position.add(direction);

    var rotation = prev_rotation.clone();
    rotation.slerp(next_rotation, delta);
    camera.quaternion.copy(rotation);

    if (delta >= 1.0)
    {
        is_animation_running = false;
    }
}

function onKeyDown(ev)
{
    /* 'f' is pressed */
    if (ev.keyCode === 70)
    {   
        toggleFullScreen();
    }
    /* 'x' is pressed */
    if (ev.keyCode === 88)
    {
        recordFrame();
    }
    /* 't' is pressed */
    if (ev.keyCode == 84)
    {
        $.ajax("/shady/keyframes/get/" + sceneMetadata.pk + "/", {
            error: function() {
                logger.error("Could not retrieve keyframes.");
            },
            success: function(data) {
                startAnimation(data);
            }
        });
    }

    keyMap[ev.keyCode] = true;
}

function recordFrame()
{
    var frame = "scene_id=" + sceneMetadata.pk
        + "&position=" + JSON.stringify(camera.position)
        + "&rotation=" + JSON.stringify(camera.quaternion);

    $.ajax("/shady/keyframes/add/", {
        data: frame,
        type: "POST",
        error: function() {
            logger.error("Could not send keyframe.");
        }
    });
}

function handleKeys()
{
    /* 'z' is pressed */
    if (keyMap[90])
    {   
        resetCamera();
    }
    /* 'w' is pressed */
    if (keyMap[87])
    {
        var translate = new THREE.Vector3(0, 0, -MOVEMENT_PER_FRAME);
        translate.applyQuaternion(camera.quaternion);
        camera.position.add(translate);
    }
    /* 's' is pressed */
    if (keyMap[83])
    {
        var translate = new THREE.Vector3(0, 0, MOVEMENT_PER_FRAME);
        translate.applyQuaternion(camera.quaternion);
        camera.position.add(translate);
    }
    /* 'a' is pressed */
    if (keyMap[65])
    {
        var translate = new THREE.Vector3(-MOVEMENT_PER_FRAME, 0, 0);
        translate.applyQuaternion(camera.quaternion);
        camera.position.add(translate);
    }
    /* 'd' is pressed */
    if (keyMap[68])
    {
        var translate = new THREE.Vector3(MOVEMENT_PER_FRAME, 0, 0);
        translate.applyQuaternion(camera.quaternion);
        camera.position.add(translate);
    }
    /* 'e' is pressed */
    if (keyMap[69])
    {
        var rotate = new THREE.Quaternion();
        var zAxis = new THREE.Vector3(0, 0, 1);
        rotate.setFromAxisAngle(zAxis, -ROTATION_PER_FRAME);
        camera.quaternion.multiply(rotate);
    }
    /* 'q' is pressed */
    if (keyMap[81])
    {
        var rotate = new THREE.Quaternion();
        var zAxis = new THREE.Vector3(0, 0, 1);
        rotate.setFromAxisAngle(zAxis, ROTATION_PER_FRAME);
        camera.quaternion.multiply(rotate);
    }
}

function onPointerLockChange()
{
    var pointerLockElement =
        document.pointerLockElement
        || document.mozPointerLockElement 
        || document.webkitPointerLockElement;
    if (pointerLockElement === renderer.domElement)
    {
        lastPageX = 0;
        lastPageY = 0;
        renderer.domElement.onmousemove = onMouseMove;
    }
    else
    {
        renderer.domElement.onmousemove = null;
    }
}

function onMouseDown(ev)
{
    /* When I wrote this code, jQuery did not support this new functionality.
    Thus the ugly platform-specific code below. */
    document.addEventListener("pointerlockchange", onPointerLockChange, false);
    document.addEventListener("mozpointerlockchange", onPointerLockChange, false);
    document.addEventListener("webkitpointerlockchange", onPointerLockChange, false);

    renderer.domElement.requestPointerLock =
        renderer.domElement.requestPointerLock
        || renderer.domElement.mozRequestPointerLock
        || renderer.domElement.webkitRequestPointerLock;

    renderer.domElement.requestPointerLock();
}

function onMouseMove(ev)
{
    var xMove = ev.movementX || ev.mozMovementX || ev.webkitMovementX;
    var yMove = ev.movementY || ev.mozMovementY || ev.webkitMovementY;

    var xDelta = xMove / div.width();
    var yDelta = yMove / div.height();

    lastPageX = ev.movementX;
    lastPageY = ev.movementY;

    var xRotation = xDelta * MOUSE_SENSITIVITY;
    var yRotation = yDelta * MOUSE_SENSITIVITY;

    xRotate = new THREE.Quaternion();
    xRotate.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -xRotation);

    yRotate = new THREE.Quaternion();
    yRotate.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -yRotation);

    camera.quaternion.multiply(xRotate);
    camera.quaternion.multiply(yRotate);
    camera.quaternion.normalize();
}

function onMeshLoaded(geometry, materials)
{
    scene.remove(mesh);

    material = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, material);

    var ms = mesh.material.materials;
    for (i in ms)
    {
        m = ms[i];
        if (m.map)
        {
            m.map.wrapS = THREE.RepeatWrapping;
            m.map.wrapT = THREE.RepeatWrapping;
        }
    }

    scene.add(mesh);

    div.append(renderer.domElement);
    onResize();
    gameLoop();

    logger.info('Mesh loaded.');
}

function toggleFullScreen()
{
    if (document.fullScreenElement ||
        document.mozFullScreenElement ||
        document.msFullScreenElement ||
        /* Yep, webkit's one is all lower case. */
        document.webkitFullscreenElement)
    {
        document.exitFullScreen = 
            document.exitFullScreen ||
            document.mozExitFullScreen ||
            document.msExitFullScreen ||
            /* Yep, webkit's one is all lower case. */
            document.webkitExitFullscreen;
        document.exitFullScreen();
    }
    else
    {
        var div = document.getElementById("experiment-block-content");

        div.requestFullScreen =
            div.requestFullScreen ||
            div.mozRequestFullScreen ||
            div.msRequestFullScreen ||
            /* No, that's not a typo. Webkit's Requestfullscreen works for
            letter keys, RequestFulLScreen doesn't. */
            div.webkitRequestFullscreen;
        div.requestFullScreen();
    }
}

function onResize()
{
    renderer.setSize(div.width(), div.height());

    camera.aspect = div.width() / div.height();
    camera.updateProjectionMatrix();
}

function main()
{
    include("lib/three.js");

    div = $('#experiment-block-content')
    renderer = new THREE.WebGLRenderer();

    $(window).keydown(onKeyDown);
    $(window).keyup(onKeyUp);
    $(window).resize(onResize);
    div.mousedown(onMouseDown);

    var csrftoken = $.cookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type)
                && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

function reset()
{
    is_animation_running = false;
    keyMap = [];

    camera = new THREE.PerspectiveCamera(FOV, 1, NEAR, FAR);

    jsonLoader = new THREE.JSONLoader();
    mesh = null;

    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0xAAAAAA);
    scene.add(ambient);

    var point = new THREE.PointLight(0xA0A0A0);
    point.position.set(0, 0, 0);
    scene.add(point);
}

function gameLoop()
{
    handleKeys();

    if (is_animation_running)
    {
        animate();
    }

    if (mesh !== null)
    {
        renderer.render( scene, camera );
    }

    requestAnimationFrame(gameLoop);
}

