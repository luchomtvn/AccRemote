$(document).on('pagecreate','#pagehome',function (event) {
  var scaledetected = 0;
  var url = $('#spaurl').text();
  $('#registerspa').parent().css('margin-top','5px');
  if (typeof($('#canvas').val()) != "undefined" &&
    url
    ) {
    var ws = '';
    var mypanel;
// just to show layout in testscreen
    if ($("#spamac").text().match(/1122334455/)) {
      var rx = "ffffffffffff";
      $("#spascreen").text(rx);
      mypanel = initpanel(ws);
      mypanel.display(rx);
      $("#pressedkey").show();
    } else {
      ws = new ReconnectingWebSocket(url);
      mypanel = initpanel(ws);
      ws.onopen = function () {
                    };
      ws.onmessage = function (e) {
      //        var rx = e.data;                   anterior version
          var j = JSON.parse(e.data);
          var rx = j.dsp;
          var stsi = j.stsI;
          var stsr = j.stsR;

          $("#spascreen").text(rx);
          if (typeof(rx) == 'string' && rx.length == 10) {
              mypanel.display(rx+"00");
          }
          else if (typeof(rx) == 'string' && rx.length == 12) {
              mypanel.display(rx);
          }
          if (scaledetected == 0 && typeof(rx) == 'string') {
            if (rx.match(/^......ce/i) || rx.match(/^f1/i)) {
              scaledetected = 1;
              $("#flip-scale").val(0).change();
            }
            else if (rx.match(/^......8f/i) || rx.match(/^b9/i)) {
              scaledetected = 1;
              $("#flip-scale").val(1).change();
            }
          }
          if (typeof (stsi) != "undefined") $("#stsi").text("stsI: "+stsi);
          if (typeof (stsr) != "undefined")  {
            $("#stsr").text("stsR: "+stsr);
//            if (stsr > 0) mypanel.resetbuttons();
            mypanel.resetbuttons();
          }
        }

      }
  }
//
//
//
$(".ui-slider-label-b").addClass('ui-btn-active');
$(".ui-slider-track").css('background', '#22aadd');
var oldvalue = $("#slider-1").attr("value");

function f2c(far)  {
  var stepval = far - 45;
  stepval = stepval.toFixed(0);
  var hstepval = Math.floor(stepval / 2);
  var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
  return cval.toFixed(1);
}


$("#slider-1").change(function() {
  if ($("#flip-scale").val() == 1)
      {
        var number = parseFloat(this.value);
        if (!(number <= templims.c.max && number >= templims.c.min)) number = f2c (parseFloat(oldvalue));
        var n10 = ((number - 7.6) * 10).toFixed(0);
        var delta = n10 % 11;
        var base = Math.floor(n10 / 11);
        if (delta > 7) {base++;delta = 0}
        else if (delta > 3) {delta = 5}
        else {delta = 0};
        var sal = base * 11 + delta;
        sal /= 10;
        sal += 7.6; 
        $(this).val(sal.toFixed(1));
        var far = 45 + base * 2;
        if (delta) far++;
        $("#slider-F").val(far.toFixed(0));
      }
  else {
        if (!(this.value <= templims.f.max && this.value >= templims.f.min)) this.value = oldvalue;
        $("#slider-F").val(this.value);
  }
}).change();

$("#slider-2").change(function (){
  $("#slider-T").val(this.value);
}).change();


$("#flip-scale").on("change", function() {
    var scale = this.value;
    var textslider = '';
    if (scale == 0) {
      textslider = 'Slider (°F):';
      $("#slider-1").attr("min", templims.f.min).attr("max", templims.f.max).attr("step", 1).val($("#slider-F").val());
    }
    else {
      textslider = 'Slider (°C):';
      var cval = f2c ($("#slider-F").val());
      $("#slider-1").attr("min", templims.c.min).attr("max", templims.c.max).attr("step", .1).val(cval);
    }
//    $("#slider-label").text(textslider);
  });
  $("#flip-scale").change();
  $("#slider-1").on('tap', function() {
    this.value = ''
  });

  $("#slider-1").bind('blur', function (e) {
    $("#slider-1").change();
  });

  $("#slider-1").on('slidestop', function (e) {
    $("#slider-1").change();
  });
});