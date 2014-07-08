var scene, camera, renderer;
var mesh, geometry, material;
var ready;
var jsonLoader;
var fov = 45;
var fov_r = fov * 3.14 / 180;

function loadMesh(name)
{
    var path = "obj/" + name + "/" + name + ".js";
    jsonLoader.load(path, onMeshLoaded);

    logger.info("Loading mesh at '" + path + "'...");
}

function onKeyPress(ev)
{
    var str = String.fromCharCode(ev.charCode);
    console.log(str);
    if (str === "1")
    {
        loadMesh("cube");
    }
    else if (str === "2")
    {
        loadMesh("teapot");
    }
    else if (str === "3")
    {
        loadMesh("cornell");
    }
    else if (str === "4")
    {
        loadMesh("conference");
    }
    else if (str === "5")
    {
        loadMesh("dragon");
    }
    else if (str === "6")
    {
        loadMesh("sibenik");
    }
    else if (str === "7")
    {
        loadMesh("sponza");
    }
    else if (str === "z")
    {   
        camera.position.z = "0";
        camera.position.y = "1";
    }
    else if (str === "w")
    {
        camera.position.z -= "1.0";
    }
    else if (str === "s")
    {
        camera.position.z += "1.0";
    }
    else if (str == "e")
    {
        camera.position.y += "1.0";
    }
    else if (str == "q")
    {
        camera.position.y -= "1.0";
    }
}

function onMeshLoaded(geometry, materials)
{
    scene.remove(mesh);

    material = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, material);

    zoomOut();

    scene.add(mesh);
}

function zoomOut()
{
    mesh.geometry.computeBoundingBox();
    camera.position.z = 1
        + mesh.geometry.boundingBox.max.z
        + mesh.geometry.boundingBox.max.y
        / Math.tan(fov_r / 2);

    logger.info("x in ["
        + mesh.geometry.boundingBox.min.x
        + ", "
        + mesh.geometry.boundingBox.max.x
        + "]");
    logger.info("y in ["
        + mesh.geometry.boundingBox.min.y
        + ", "
        + mesh.geometry.boundingBox.max.y
        + "]");
    logger.info("z in ["
        + mesh.geometry.boundingBox.min.z
        + ", "
        + mesh.geometry.boundingBox.max.z
        + "]");
    logger.info("tan = " + Math.tan(fov_r));
    logger.info("z = " + camera.position.z);

    logger.info("Loaded mesh...");
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
    
    camera = new THREE.PerspectiveCamera( fov, window.innerWidth /
        window.innerHeight, 1, 5000 );

    scene = new THREE.Scene();

    jsonLoader = new THREE.JSONLoader();
    mesh = null;
    loadMesh("teapot");

    var ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    var point = new THREE.PointLight(0xA0A0A0);
    point.position.set(0, 0, 1000);
    scene.add(point);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
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

