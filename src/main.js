var scene, camera, renderer;
var mesh, geometry, material;
var div;
var ready;
var jsonLoader;
var fov = 45;
var fov_r = fov * 3.14 / 180;

function loadMesh(pk)
{
    init();

    $.ajax({url: '/shady/scenes/get/' + pk + '/',
        async: false})
        .done(function(result) {
            var scene = $.parseJSON(result);
            var url = scene[0].fields["url"] + "/mesh.js";
            jsonLoader.load(url, onMeshLoaded);
            logger.info("Loading mesh at '" + url + "'...");

            var coords = scene[0].fields["camera_start"].split(",");
            camera.position.x = parseFloat(coords[0]);
            camera.position.y = parseFloat(coords[1]);
            camera.position.z = parseFloat(coords[2]);
        });
}

function onKeyPress(ev)
{
    var str = String.fromCharCode(ev.charCode);
    console.log(str);

    if (str === "z")
    {   
        zoomOut();
    }
    else if (str === "w")
    {
        camera.position.z -= 1.0;
    }
    else if (str === "s")
    {
        camera.position.z += 1.0;
    }
    else if (str == "a")
    {
        mesh.rotation.y -= 0.1; 
    }
    else if (str == "d")
    {
        mesh.rotation.y += 0.1;
    }
    else if (str == "e")
    {
        camera.position.y += 1.0;
    }
    else if (str == "c")
    {
        zoomOut();
    }
    else if (str == "q")
    {
        camera.position.y -= 1.0;
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
    animate();

    logger.info('Mesh loaded.');
}

function zoomOut()
{
    mesh.geometry.computeBoundingBox();
    camera.position.z = 1
        + mesh.geometry.boundingBox.max.z
        + mesh.geometry.boundingBox.max.y
        / Math.tan(fov_r / 2);
}

function main()
{
    include("lib/three.js");

    div = $('#experiment-block-content')
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( div.width(), div.height() );

    $(window).keypress(onKeyPress);
}

function init()
{
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

function animate()
{
    requestAnimationFrame( animate );

    if (mesh !== null)
    {
        renderer.render( scene, camera );
    }
}

