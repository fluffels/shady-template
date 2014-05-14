/**
 * Find and return the WebGL context used by the browser.
 *
 * @return A valid WebGL context if one was found, null otherwise.
 */
function get_web_gl_context()
{
    var canvas = document.getElementById("canvas");
    if (canvas == null)
    {
        return null;
    }

    var gl = null;
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (var i = 0; i < names.length; i++)
    {
        gl = canvas.getContext(names[i]);

        if (gl)
        {
            return gl;
        }
    }

    return null;
}

/**
 * Load a file.
 *
 * @param path The file's path, relative to the web root.
 * @return The file's contents as a string.
 */
function load_file(path)
{
    var src;

    $.ajax({
        async: false,
        url: path,
        success: function(result) {
            src = result;
        }
    });

    return src;
}

/**
 * Include a js file.
 * This simply loads the file and evaluates it, potentially polluting the
 * global context.
 * If you care about this, use a namespace in the file you're including, or
 * use something like require.js
 *
 * @param path The path to the file to include.
 */
function include(path)
{
    $.ajax(
    {
        async: false,
        url: path,
        dataType: "script"
    });
}

