$(document).on('pagecreate','#pagehome',function (event) {
//called when keyup numeric keyboard
//    $("input.cnumber").keyup(function () {
//       var v = $(this).val();
//       if (v > 99999) {$(this).removeClass("right").addClass("wrong")}
//       else if (v < 10000) {$(this).removeClass("right").addClass("wrong")}
//       else {
//        $(this).removeClass("wrong").addClass("right");
//        if ($(this).focus()) $(this).next.focus();
//      }
//       return true;
//     });
  var url = $('#spaurl').text();
  var dis = new Array();
  var paper;
  var attr1 = $("#sevensegments-frame");
  attr1.attr("style", "fill-opacity:0");
  attr1.append('<span id="canvas"></span>');
  initpanel();
  if (typeof($('#canvas').val()) != "undefined" &&
    url
    ) {

    var scale = 10;
    var angle = 10;
    var sa = Math.sin(angle * Math.PI / 180);
    var dx = scale * sa;
    var tx = 0.15*scale;
    var ty = 0.15*scale;

    var px = scale + 2*tx + 2*dx;
    var py = 2*scale + 2*ty;
    var ws = new ReconnectingWebSocket(url);

    var paper = new Raphael('canvas', 6 * px, 4 * py);
    var dis = new Array();

    dis[3] = new draw7seg(paper, 0 , 0, scale, angle,dx, 0);
    dis[2] = new draw7seg(paper, px, 0, scale, angle, dx,0);
    dis[1] = new draw7seg(paper, 2 * px, 0, scale, angle, dx,1);
    dis[0] = new draw7seg(paper, 3 * px, 0, scale, angle, dx,1);
    dis[4] = new otherleds(paper, scale, dx, ws);

    dis[0].segments[0].touchstart(function (e) {
        dis[0].display("49");
    });
    dis[0].segments[0].touchend(function (e) {
        dis[0].display("00");
    });


    ws.onopen = function () {
//                  ws.send('1');
                  };
    ws.onmessage = function (e) {
//        var rx = e.data;                   anterior version
        var j = JSON.parse(e.data);
        var rx = j.dsp;
        $("#spascreen").text(rx);
        if (typeof(rx) == 'string' && rx.length == 10) {
          for (var ii = 0; ii < 5; ii++) {
            dis[ii].display(rx.substring(ii*2,ii*2+2))
          }
        }
//        ws.send(rx);
      }
// just to show layout in testscreen
  if ($("#spamac").text().match(/1122334455/)) {
        var rx = "ffffffffff";
        $("#spascreen").text(rx);
          for (var ii = 0; ii < 5; ii++) {
            dis[ii].display(rx.substring(ii*2,ii*2+2))
          }
  }


  }


});