var sceneMetadata;
var scene, camera, renderer;
var mesh, geometry, material;
var div;
var ready;
var jsonLoader;
var fov = 45;
var fov_r = fov * 3.14 / 180;
var viewMatrix;
var keyMap;

var MOVEMENT_PER_FRAME = 0.1;
var ROTATION_PER_FRAME = 0.01;

function resetCamera()
{
    var eye = sceneMetadata[0].fields.eye.split(",");
    var eyeVec = new THREE.Vector3(
        parseFloat(eye[0]),
        parseFloat(eye[1]),
        parseFloat(eye[2])
    );
    camera.position = eyeVec;

    var up = sceneMetadata[0].fields.up.split(",");
    var upVec = new THREE.Vector3(
        parseFloat(up[0]),
        parseFloat(up[1]),
        parseFloat(up[2])
    );

    var at = sceneMetadata[0].fields.at.split(",");
    var atVec = new THREE.Vector3(
        parseFloat(at[0]),
        parseFloat(at[1]),
        parseFloat(at[2])
    );

    viewMatrix = new THREE.Matrix4();
    viewMatrix = viewMatrix.lookAt(eyeVec, atVec, upVec);

    camera.quaternion.setFromRotationMatrix(viewMatrix);
}

function loadMesh(pk)
{
    init();

    $.ajax({url: '/shady/scenes/get/' + pk + '/',
        async: false})
        .done(function(result) {
            sceneMetadata = $.parseJSON(result);
            resetCamera();

            var url = sceneMetadata[0].fields["url"] + "/mesh.js";
            jsonLoader.load(url, onMeshLoaded);
            logger.info("Loading mesh at '" + url + "'...");
        });
}

function onKeyUp(ev)
{
    keyMap[ev.keyCode] = false;
}

function onKeyDown(ev)
{
    keyMap[ev.keyCode] = true;
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
        translate = new THREE.Vector3(0, 0, -MOVEMENT_PER_FRAME);
        translate.applyMatrix4(viewMatrix);
        camera.position.add(translate);
    }
    /* 's' is pressed */
    if (keyMap[83])
    {
        translate = new THREE.Vector3(0, 0, MOVEMENT_PER_FRAME);
        translate.applyMatrix4(viewMatrix);
        camera.position.add(translate);
    }
    /* 'a' is pressed */
    if (keyMap[65])
    {
        rotate = new THREE.Matrix4();
        rotate.makeRotationY(ROTATION_PER_FRAME);
        viewMatrix.multiply(rotate);
        camera.quaternion.setFromRotationMatrix(viewMatrix);
    }
    /* 'd' is pressed */
    if (keyMap[68])
    {
        rotate = new THREE.Matrix4();
        rotate.makeRotationY(-ROTATION_PER_FRAME);
        viewMatrix.multiply(rotate);
        camera.quaternion.setFromRotationMatrix(viewMatrix);
    }
    /* 'e' is pressed */
    if (keyMap[69])
    {
        translate = new THREE.Vector3(0, MOVEMENT_PER_FRAME, 0);
        translate.applyMatrix4(viewMatrix);
        camera.position.add(translate);
    }
    /* 'q' is pressed */
    if (keyMap[81])
    {
        translate = new THREE.Vector3(0, -MOVEMENT_PER_FRAME, 0);
        translate.applyMatrix4(viewMatrix);
        camera.position.add(translate);
    }
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
    gameLoop();

    logger.info('Mesh loaded.');
}

function main()
{
    include("lib/three.js");

    div = $('#experiment-block-content')
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( div.width(), div.height() );

    $(window).keydown(onKeyDown);
    $(window).keyup(onKeyUp);
}

function init()
{
    keyMap = [];

    camera = new THREE.PerspectiveCamera( fov, div.width() / div.height(), 1, 5000 );

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
    requestAnimationFrame(gameLoop);

    handleKeys();

    if (mesh !== null)
    {
        renderer.render( scene, camera );
    }
}

