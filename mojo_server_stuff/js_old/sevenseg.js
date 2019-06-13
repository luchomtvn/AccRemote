         
/**
* Draw a 7 segment display using Raphael canvas.
*/
function draw7seg (paper, x, y, scale, angle, dx, dotpos) {

//    var angle = 10; // angle must be +

    var ri = "r"+angle;
    var rf = "r-"+angle;
    var rv = "r"+(90+angle);
    var tx = 0.15*scale;
    var ty = 0.15*scale;

    var px = scale + 2*tx + 2*dx;
    var py = 2*scale + 2*ty;

    var seg = paper.path("M 0 0 L 0.15 0.1 L 0.85 0.1 L 1.0 0 L 0.85 -0.1 L 0.15 -0.1 Z");


    this.segments = new Array();
    for (var i=0; i<7; i++) {
        this.segments[i] = seg.clone();
        }

    seg.remove();             

    var segs = this.segments;
    segs[0].transform("t" + (x + 3 * tx + scale/2 + 2 * dx) + "," + (y + ty) + "s" + scale);
    segs[1].transform("t" + (x + 3 * tx + scale + 2 * dx) + "," + (scale/2 + y + ty) + rv + "s" + scale);
    segs[2].transform("t" + (x + 3 * tx + scale + dx) + "," + (y + scale/2 + ty + scale) + rv + "s" + scale);
    segs[3].transform("t" + (x + 3 * tx + scale/2) + "," + (y + 2*scale + ty) + "s" + scale);
    segs[4].transform("t" + (x + 3 * tx) + "," + (y + scale/2 + ty + scale) + rv + "s" + scale);
    segs[5].transform("t" + (x + 3 * tx + dx) + "," + (y + scale/2 + ty) + rv + "s" + scale);
    segs[6].transform("t" + (x + 3 * tx + scale/2 + dx) + "," + (y + ty + scale) + "s" + scale);         

    var pdotx = dotpos ? dx : px-dx;
    var pdoty = dotpos ? ty : py-ty;
    segs[7] = paper.circle(x + 2 * tx + pdotx, y + pdoty, scale / 10);
    for (var i=0; i<8; i++) {
        segs[i].attr("fill","#2a2a2a");
        segs[i].attr("stroke","#2a2a2a");
        }
    this.display = function (hexv) {
        var dd = 0;
        if (typeof(hexv) == 'string' && hexv.length == 2) {
            dd = parseInt(hexv,16);
            if (dd == 'NaN') dd = 0;
        }
        for (var ii = 0, mm = 1;ii < 8; ii++,mm <<= 1) {
            this.segments[ii].attr("fill" ,(mm & dd) ? "#f00" : "#2a2a2a");
            }
        }
    this.display("40");
    }

function path_line(angle, l1, l2, tick) {

    var alfa = Math.asin(tick/2/l1);
    var beta = Math.asin(tick/2/l2);

    var x0 = l1 * Math.cos(angle * Math.PI / 180 - alfa);
    var y0 = l1 * Math.sin(angle * Math.PI / 180 - alfa);

    var dx1 = l2 * Math.cos(angle * Math.PI / 180 - beta) - x0;
    var dy1 = l2 * Math.sin(angle * Math.PI / 180 - beta) - y0;

    var dx2 = l2 * Math.cos(angle * Math.PI / 180 + beta) - dx1 - x0;
    var dy2 = l2 * Math.sin(angle * Math.PI / 180 + beta) - dy1 - y0;

    var dx3 = l1 * Math.cos(angle * Math.PI / 180 + alfa) - dx2 - dx1 - x0;
    var dy3 = l1 * Math.sin(angle * Math.PI / 180 + alfa) - dy2 - dy1 - y0;

    var dx0 = -dx3 - dx2 - dx1;
    var dy0 = -dy3 - dy2 - dy1;

    return  "m"+x0+","+y0+
            "l"+dx1+","+dy1+
            "l"+dx2+","+dy2+
            "l"+dx3+","+dy3+
            "l"+dx0+","+dy0+
            "z"+
            "m"+(-x0)+","+(-y0);
}

function path_set (angle, r, t) {
    var t2 = t / 2;
    var r1 = r - t2;
    var r2 = r + t2;
    var sa = Math.sin(angle  * Math.PI / 180);
    var ca = Math.cos(angle * Math.PI / 180);
    var x1 = r1 * sa;
    var x2 = r2 * sa;
    var x21 = x2 - x1;
    var y1 = r1 * ca;
    var y2 = r2 * ca;
    var y21 = y2 - y1;
    var sal = "m"+x1+","+y1+"a"+r1+","+r1+",0,1,0,-"+(2*x1)+",0";
    sal += "a"+t2+","+t2+",0,0,1,-"+x21+","+y21;
    sal += "a"+r2+","+r2+",0,1,1,"+(2*x2)+",0";
    sal += "a"+t2+","+t2+",0,1,1,-"+x21+",-"+y21+"m-"+x1+",-"+y1;
    sal += "m"+t2+","+t2+"v"+r1+"a"+t2+","+t2+",0,0,1,-"+t+",0"+"v-"+r1;
    sal += "a"+t2+","+t2+",0,1,1,"+t+",0";
    return sal;
}

function otherleds (paper, scale, dx, websocket) {

//    var angle = 10; // angle must be +

    var bscale = scale * 1.5;

    var tx = 0.15*scale;
    var ty = 0.15*scale;

    var px = scale + 2*tx + 2*dx;
    var py = 2*scale + 2*ty;

    var x3 = px / 2 + 4 * tx; // half of first 7 seg D3
    var x2 = x3 + px;
    var x1 = x2 + px;
    var x0 = x1 + px;
    var xa = 4 * px + 5 * tx;
    var xz = xa + tx;
    var xb = 4.5 * px + 6*tx;
    var ya = ty;
    var y1 = ya + ty;
    var y2 = y1 + py / 8;
    var y3 = y2 + py / 8;
    var y4 = y3 + py / 8;
    var y5 = y4 + py / 8;
    var y6 = y5 + py / 8;
    var y7 = y6 + 3 * py / 8 + 2 * ty;
    var y8 = y7 + bscale + 2 * ty;

    var xbair = x3 - px / 2 + 2 * tx;
    var xb2 = xbair + bscale + 2 * tx;
    var xbjets = xbair + 2 * (bscale + 2 * tx);
    var xb4 = xbjets + bscale + 2 * tx;
    var xbset = xbair + 4 * (bscale + 2 * tx);
//
// paths for buttons
//
    var button_set_temp    = paper.path("M17.5,19.508V8.626h-3.999v10.881c-1.404,0.727-2.375,2.178-2.375,3.869c0,2.416,1.959,4.375,4.375,4.375s4.375-1.959,4.375-4.375C19.876,21.686,18.905,20.234,17.5,19.508zM20.5,5.249c0-2.757-2.244-5-5.001-5s-4.998,2.244-4.998,5v12.726c-1.497,1.373-2.376,3.314-2.376,5.4c0,4.066,3.31,7.377,7.376,7.377s7.374-3.311,7.374-7.377c0-2.086-0.878-4.029-2.375-5.402V5.249zM20.875,23.377c0,2.963-2.41,5.373-5.375,5.373c-2.962,0-5.373-2.41-5.373-5.373c0-1.795,0.896-3.443,2.376-4.438V5.251c0-1.654,1.343-3,2.997-3s3,1.345,3,3v13.688C19.979,19.934,20.875,21.582,20.875,23.377z");
    var button_set_clock    = paper.path("M15.5,2.374C8.251,2.375,2.376,8.251,2.374,15.5C2.376,22.748,8.251,28.623,15.5,28.627c7.249-0.004,13.124-5.879,13.125-13.127C28.624,8.251,22.749,2.375,15.5,2.374zM15.5,25.623C9.909,25.615,5.385,21.09,5.375,15.5C5.385,9.909,9.909,5.384,15.5,5.374c5.59,0.01,10.115,4.535,10.124,10.125C25.615,21.09,21.091,25.615,15.5,25.623zM8.625,15.5c-0.001-0.552-0.448-0.999-1.001-1c-0.553,0-1,0.448-1,1c0,0.553,0.449,1,1,1C8.176,16.5,8.624,16.053,8.625,15.5zM8.179,18.572c-0.478,0.277-0.642,0.889-0.365,1.367c0.275,0.479,0.889,0.641,1.365,0.365c0.479-0.275,0.643-0.887,0.367-1.367C9.27,18.461,8.658,18.297,8.179,18.572zM9.18,10.696c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366c0.479,0.276,1.09,0.113,1.367-0.366C9.821,11.584,9.657,10.973,9.18,10.696zM22.822,12.428c0.478-0.275,0.643-0.888,0.366-1.366c-0.275-0.478-0.89-0.642-1.366-0.366c-0.479,0.278-0.642,0.89-0.366,1.367C21.732,12.54,22.344,12.705,22.822,12.428zM12.062,21.455c-0.478-0.275-1.089-0.111-1.366,0.367c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.277,1.091,0.111,1.365-0.365C12.704,22.344,12.54,21.732,12.062,21.455zM12.062,9.545c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,9.658,11.584,9.822,12.062,9.545zM22.823,18.572c-0.48-0.275-1.092-0.111-1.367,0.365c-0.275,0.479-0.112,1.092,0.367,1.367c0.477,0.275,1.089,0.113,1.365-0.365C23.464,19.461,23.3,18.848,22.823,18.572zM19.938,7.813c-0.477-0.276-1.091-0.111-1.365,0.366c-0.275,0.48-0.111,1.091,0.366,1.367s1.089,0.112,1.366-0.366C20.581,8.702,20.418,8.089,19.938,7.813zM23.378,14.5c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1c0.551,0,1-0.447,1-1C24.378,14.949,23.929,14.5,23.378,14.5zM15.501,6.624c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96c-0.478,0.277-0.642,0.889-0.365,1.365c0.275,0.479,0.889,0.643,1.365,0.367l3.305-1.676C15.39,16.99,15.444,17,15.501,17c0.828,0,1.5-0.671,1.5-1.5l-0.5-7.876C16.501,7.072,16.053,6.624,15.501,6.624zM15.501,22.377c-0.552,0-1,0.447-1,1s0.448,1,1,1s1-0.447,1-1S16.053,22.377,15.501,22.377zM18.939,21.455c-0.479,0.277-0.643,0.889-0.366,1.367c0.275,0.477,0.888,0.643,1.366,0.365c0.478-0.275,0.642-0.889,0.366-1.365C20.028,21.344,19.417,21.18,18.939,21.455z");
    var button_air          = paper.path("M24.345,13.904c0.019-0.195,0.03-0.392,0.03-0.591c0-3.452-2.798-6.25-6.25-6.25c-2.679,0-4.958,1.689-5.847,4.059c-0.589-0.646-1.429-1.059-2.372-1.059c-1.778,0-3.219,1.441-3.219,3.219c0,0.21,0.023,0.415,0.062,0.613c-2.372,0.391-4.187,2.436-4.187,4.918c0,2.762,2.239,5,5,5h2.312c-0.126-0.266-0.2-0.556-0.2-0.859c0-0.535,0.208-1.04,0.587-1.415l4.325-4.329c0.375-0.377,0.877-0.585,1.413-0.585c0.54,0,1.042,0.21,1.417,0.587l4.323,4.329c0.377,0.373,0.585,0.878,0.585,1.413c0,0.304-0.073,0.594-0.2,0.859h1.312c2.762,0,5-2.238,5-5C28.438,16.362,26.672,14.332,24.345,13.904z M16.706,17.916c-0.193-0.195-0.45-0.291-0.706-0.291s-0.512,0.096-0.707,0.291l-4.327,4.33c-0.39,0.389-0.389,1.025,0.001,1.414l0.556,0.555c0.39,0.389,0.964,0.449,1.276,0.137s0.568-0.119,0.568,0.432v1.238c0,0.549,0.451,1,1,1h3.265c0.551,0,1-0.451,1-1v-1.238c0-0.551,0.256-0.744,0.569-0.432c0.312,0.312,0.887,0.252,1.276-0.137l0.556-0.555c0.39-0.389,0.39-1.025,0.001-1.414L16.706,17.916z");
//    var button_set         = paper.path("M25.542,8.354c-1.47-1.766-2.896-2.617-3.025-2.695c-0.954-0.565-2.181-0.241-2.739,0.724c-0.556,0.961-0.24,2.194,0.705,2.763c0,0,0.001,0,0.002,0.001c0.001,0,0.002,0.001,0.003,0.002c0.001,0,0.003,0.001,0.004,0.001c0.102,0.062,1.124,0.729,2.08,1.925c1.003,1.261,1.933,3.017,1.937,5.438c-0.001,2.519-1.005,4.783-2.64,6.438c-1.637,1.652-3.877,2.668-6.368,2.669c-2.491-0.001-4.731-1.017-6.369-2.669c-1.635-1.654-2.639-3.919-2.64-6.438c0.005-2.499,0.995-4.292,2.035-5.558c0.517-0.625,1.043-1.098,1.425-1.401c0.191-0.152,0.346-0.263,0.445-0.329c0.049-0.034,0.085-0.058,0.104-0.069c0.005-0.004,0.009-0.006,0.012-0.008s0.004-0.002,0.004-0.002l0,0c0.946-0.567,1.262-1.802,0.705-2.763c-0.559-0.965-1.785-1.288-2.739-0.724c-0.128,0.079-1.555,0.93-3.024,2.696c-1.462,1.751-2.974,4.511-2.97,8.157C2.49,23.775,8.315,29.664,15.5,29.667c7.186-0.003,13.01-5.892,13.012-13.155C28.516,12.864,27.005,10.105,25.542,8.354zM15.5,17.523c1.105,0,2.002-0.907,2.002-2.023h-0.001V3.357c0-1.118-0.896-2.024-2.001-2.024s-2.002,0.906-2.002,2.024V15.5C13.498,16.616,14.395,17.523,15.5,17.523z");
    var bsp = "M16,16"+path_set(30,10,4);
    var button_set         = paper.path(bsp);
    var button_flip         = paper.path("M24.249,15.499c-0.009,4.832-3.918,8.741-8.75,8.75c-2.515,0-4.768-1.064-6.365-2.763l2.068-1.442l-7.901-3.703l0.744,8.694l2.193-1.529c2.244,2.594,5.562,4.242,9.26,4.242c6.767,0,12.249-5.482,12.249-12.249H24.249zM15.499,6.75c2.516,0,4.769,1.065,6.367,2.764l-2.068,1.443l7.901,3.701l-0.746-8.693l-2.192,1.529c-2.245-2.594-5.562-4.245-9.262-4.245C8.734,3.25,3.25,8.734,3.249,15.499H6.75C6.758,10.668,10.668,6.758,15.499,6.75z");
    var button_lite         = paper.path("M12.75,25.498h5.5v-5.164h-5.5V25.498zM15.5,28.166c1.894,0,2.483-1.027,2.667-1.666h-5.334C13.017,27.139,13.606,28.166,15.5,28.166zM15.5,2.833c-3.866,0-7,3.134-7,7c0,3.859,3.945,4.937,4.223,9.499h1.271c-0.009-0.025-0.024-0.049-0.029-0.078L11.965,8.256c-0.043-0.245,0.099-0.485,0.335-0.563c0.237-0.078,0.494,0.026,0.605,0.25l0.553,1.106l0.553-1.106c0.084-0.17,0.257-0.277,0.446-0.277c0.189,0,0.362,0.107,0.446,0.277l0.553,1.106l0.553-1.106c0.084-0.17,0.257-0.277,0.448-0.277c0.189,0,0.36,0.107,0.446,0.277l0.554,1.106l0.553-1.106c0.111-0.224,0.368-0.329,0.604-0.25s0.377,0.318,0.333,0.563l-1.999,10.998c-0.005,0.029-0.02,0.053-0.029,0.078h1.356c0.278-4.562,4.224-5.639,4.224-9.499C22.5,5.968,19.366,2.833,15.5,2.833zM17.458,10.666c-0.191,0-0.364-0.107-0.446-0.275l-0.554-1.106l-0.553,1.106c-0.086,0.168-0.257,0.275-0.446,0.275c-0.191,0-0.364-0.107-0.449-0.275l-0.553-1.106l-0.553,1.106c-0.084,0.168-0.257,0.275-0.446,0.275c-0.012,0-0.025,0-0.037-0.001l1.454,8.001h1.167l1.454-8.001C17.482,10.666,17.47,10.666,17.458,10.666z");
    var button_jets         = paper.path("M2.5,7h2a15,15,0,0,1,0,20h-2z"+
                               "M-7.5,17"+
                               path_line(-20,15,25,2) + path_line(-20,30,35,2) +
                               path_line(-10,15,25,2) + path_line(-10,30,35,2) +
                               path_line(  0,15,25,2) + path_line(  0,30,35,2) +
                               path_line( 10,15,25,2) + path_line( 10,30,35,2) +
                               path_line( 20,15,25,2) + path_line( 20,30,35,2)
                                );
    var rect_trans          = paper.rect(0,0,32,32,5);
    rect_trans.attr({fill:"#000", "fill-opacity": 0, stroke: "#888", "stroke-width" : 3});

    this.buttons = new Array();
    this.buttons[0] = { b:button_set_temp,     t:"t" + xb4 + "," + y8 + "s" + (bscale / 32),
                        c: $("#lnksliderTemp")
                        };

    this.buttons[1] = { b:button_set_clock,    t:"t" + xbset + "," + y8 + "s" + (bscale / 32),
                        c: $("#lnkselectTZ")
                        };

    this.buttons[2] = {b:button_air, t:"t" + xbair + "," + y7 + "s" + (bscale / 32)};
    this.buttons[3] = {b:button_jets, t:"t" + xbjets + "," + y7 + "s" + (bscale / 32)};
    this.buttons[4] = {b:button_set, t:"t" + xbset + "," + y7 + "s" + (bscale / 32)};
    this.buttons[5] = {b:button_flip, t:"t" + xbair + "," + y8 + "s" + (bscale / 32)};
    this.buttons[6] = {b:button_lite, t:"t" + xb2 + "," + y8 + "s" + (bscale / 32)};

    for (var i=0;i<7;i++) {
        this.buttons[i].b.attr({fill:"#888", stroke: "none"});
        this.buttons[i]["r"] = rect_trans.clone();
        this.buttons[i].b.transform(this.buttons[i].t);
        this.buttons[i].r.transform(this.buttons[i].t);
        this.buttons[i].r.data("c", this.buttons[i].c);
        this.buttons[i].r.data("btns", this.buttons);
        this.buttons[i].r.data("i", i);
        this.buttons[i].a = 0;
        this.buttons[i].r.mousedown(function () {
            if (!!this.data("c")) {this.data("c").click();return;}
            var d = new Date();
            var tnow = d.getTime();
            var btns = this.data("btns");
            var i = this.data("i");
            if (tnow > btns[i].a + 1000) {
                btns[i].a = tnow;
                websocket.send(i);
            }
            for (var ii = 0; ii < 7; ii++) {
                btns[ii].b.attr(ii == i ? {fill:"#88f"} : {fill:"#ccc"});
                btns[ii].r.attr(ii == i ? {stroke:"#88f"} : {stroke:"#ccc"});
            };

            this.mouseup(function () {
                for (var ii = 0; ii < 7; ii++) {
                    btns[ii].b.attr({fill:"#888"});
                    btns[ii].r.attr({stroke:"#888"});
                };
            });
            this.mouseout(function () {
                for (var ii = 0; ii < 7; ii++) {
                    btns[ii].b.attr({fill:"#888"});
                    btns[ii].r.attr({stroke:"#888"});
                };
            });
            this.touchmove(function () {
                for (var ii = 0; ii < 7; ii++) {
                    btns[ii].b.attr({fill:"#888"});
                    btns[ii].r.attr({stroke:"#888"});
                };
            });
        });

//        this.buttons[i].r.touchstart(function () {
//            if (!!this.data("c")) {this.data("c").click();return;}
//            this.data("icon").attr({fill:"#88f", stroke: "none"});
//            this.touchend(function () {
//                this.data("icon").attr({fill:"#888", stroke: "none"})});
//            this.touchmove(function () {
//                this.data("icon").attr({fill:"#888", stroke: "none"})});
//        });
    };
    rect_trans.remove();

    this.segments = new Array();
    this.segments[0] = paper.text(xz, 2*y1, "Heating");
    this.segments[6] = paper.text(xz, 2*y2, "OverHeat");
    this.segments[5] = paper.text(xz, 2*y3, "Edit");
    this.segments[4] = paper.text(xz, 2*y4, "Filtering");
    this.segments[1] = paper.text(xb2, 2*y5, "Air HI");
    this.segments[3] = paper.text(xb4, 2*y5, "Jets Hi");
    this.segments[2] = paper.text(xb4, 2*y6, "Jets Lo");
    this.segments[7] = paper.text(xa, 2*ya,"AM");

    for (var ii = 0;ii < 8; ii++) {
        this.segments[ii].attr({
            "font-size": "8px",
            "font-weight": "800", 
            "text-anchor": "start",
            fill: "#0f0",
            stroke: "#0f0",
            "stroke-width": "0px"
        });
        $(this.segments[ii].node).css({
        "-webkit-touch-callout": "none",
        "-webkit-user-select": "none",
        "-khtml-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none"
        });
        $('tspan:first-child',this.segments[ii].node).attr('dy',0);
        }
    this.display = function (hexv) {
        var dd = 0;
        if (typeof(hexv) == 'string' && hexv.length == 2) {
            dd = parseInt(hexv,16);
            if (dd == 'NaN') dd = 0;
        }
        for (var ii = 0, mm = 1;ii < 8; ii++,mm <<= 1) {
            this.segments[ii].attr("fill" ,(mm & dd) ? "#f00" : "#2a2a2a");
            }
        }
    this.display("00");
    }
