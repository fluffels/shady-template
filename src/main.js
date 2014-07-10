var scene, camera, renderer;
var mesh, geometry, material;
var ready;
var jsonLoader;
var fov = 45;
var fov_r = fov * 3.14 / 180;

function loadMesh(path)
{
    var url = path + "mesh.js";
    jsonLoader.load(url, onMeshLoaded);

    logger.info("Loading mesh at '" + url + "'...");
}

function onKeyPress(ev)
{
    var str = String.fromCharCode(ev.charCode);
    console.log(str);

    if (str === "z")
    {   
        camera.position.z = 0;
        camera.position.y = 1;
    }
    else if (str === "w")
    {
        camera.position.z -= 1.0;
    }
    else if (str === "s")
    {
        camera.position.z += 1.0;
    }
    else if (str == "e")
    {
        camera.position.y += 1.0;
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

    zoomOut();

    scene.add(mesh);

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
    init();
    $(window).keypress(onKeyPress);
    animate();
}

function init()
{
    scene = new THREE.Scene();

    var div = $('#experiment-block-content')
    var width = div.width()
    var height = div.height()
    
    camera = new THREE.PerspectiveCamera( fov, width / height, 1, 5000 );

    scene = new THREE.Scene();

    jsonLoader = new THREE.JSONLoader();
    mesh = null;
    loadMesh(MESH_PATH);

    var ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    var point = new THREE.PointLight(0xA0A0A0);
    point.position.set(0, 0, 1000);
    scene.add(point);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );

    div.append(renderer.domElement);
}

function animate()
{
    requestAnimationFrame( animate );

    if (mesh !== null)
    {
        mesh.rotation.y += 0.01;

        renderer.render( scene, camera );
    }
}

