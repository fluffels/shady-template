var gl;

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function keyboard(ev)
{
}

function reshape()
{
    var newWidth = $("canvas").width();
    var newHeight = $("canvas").height();

    $("canvas").attr("width", newWidth);
    $("canvas").attr("height", newHeight);
    gl.viewport(0, 0, newWidth, newHeight);

    logger.info("Resized: width = " + newWidth + " height = " + newHeight);

    display();
}

function update()
{
    display();
}

function main()
{
    logger.trace("main()");

    gl = get_web_gl_context();
    if (gl == null)
    {
        logger.fatal("No WebGL context could be created!");
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    $(window).resize(reshape);
    $(window).keypress(keyboard);

    window.setInterval(update, 16);

    reshape();
}

