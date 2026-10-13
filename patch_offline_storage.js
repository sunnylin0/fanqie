const fs = require('fs');

// Patch web/index.html to include zhipu-local-renderer.js and local file input
let html = fs.readFileSync('web/index.html', 'utf8');
if (!html.includes('zhipu-local-renderer.js')) {
  html = html.replace(
    '<script src="Zhipu-jsCode.js"></script>',
    '<script src="zhipu-local-renderer.js"></script>\n<script src="Zhipu-jsCode.js"></script>'
  );
}

if (!html.includes('localFileInput')) {
  html = html.replace(
    '</body>',
    '<input type="file" id="localFileInput" accept=".jps,.txt" style="display:none;" />\n</body>'
  );
}
fs.writeFileSync('web/index.html', html);

// Patch web/Zhipu-jsCode.js to support local redraw and local file save/open
let js = fs.readFileSync('web/Zhipu-jsCode.js', 'utf8');

// Replace redraw to support local rendering
const localRedrawCode = `
function redraw(pNum, redrawSource) {
  var jpcode = window.frames["editFrame"].document.getElementById("editor_text").value;
  var customCode = $("textarea[name=customCode]").text();
  var pageConfig = $("textarea[name=pageConfig]").text();
  localStorage.setItem('JPcode', jpcode);

  if (window.renderZhipuScore) {
    try {
      var localSvg = window.renderZhipuScore(jpcode);
      if ($("#page_0").length === 0) {
        $(".preview .svgList").append('<div class="page" id="page_0">' + localSvg + '</div>');
      } else {
        $("#page_0").html(localSvg);
      }
      var svgWidth = $("#page_0 svg").attr('width') || 840;
      var svgHeight = $("#page_0 svg").attr('height') || 1193;
      $(".svgList").css({'width': svgWidth, 'height': svgHeight});
      $(".page").css({'width': svgWidth, 'height': svgHeight});
      $('use[notepos]').click(function(e) {
        if (window.frames["editFrame"] && window.frames["editFrame"].setPos) {
          window.frames["editFrame"].setPos($(this).attr('notepos'));
        }
      });
      if (redrawSource == 'editor' && window.frames["editFrame"].getGbInfo) {
        window.frames["editFrame"].getGbInfo();
      }
      return;
    } catch (e) {
      console.warn("Local render fallback to remote:", e);
    }
  }

  // Remote fallback
  jpcode = jpcode.replace(/\\n/g, "&hh&");
  customCode = customCode.replace(/\\n/g, "&hh&");
  $.post('http://zhipu.lezhi99.com/Zhipu-draw', {code: jpcode, customCode: customCode, pageConfig: pageConfig, pageNum: pNum}, function(re) {
    var arr = re.split('[fenye]');
    var arrLen = arr.length;
    var pageNum = -1;
    for (var i = 0; i < arrLen; i++) {
      var pageObj = $("#page_" + i);
      if (arr[i] != '') {
        if (pageObj.length == 0) {
          $(".preview .svgList").append('<div class="page" id="page_' + i + '">' + arr[i] + '</div>');
        } else {
          if (arr[i] != 'noRedraw') pageObj.html(arr[i]);
        }
        pageNum++;
      }
    }
    $(".page").each(function(index, element) { if (index > pageNum) $(element).remove(); });
    var svgWidth = $("#page_0 svg").attr('width');
    var svgHeight = $("#page_0 svg").attr('height');
    $(".svgList").css({'width': svgWidth, 'height': svgHeight});
    $(".page").css({'width': svgWidth, 'height': svgHeight});
  });
}
`;

// Replace existing redraw definition
js = js.replace(/function redraw\(pNum,redrawSource\)[\s\S]*?setLockCustom\(\);\}\);\}\s*/, localRedrawCode);

// Add local save / open functions
const localSaveOpenCode = `
// --- Local File Save & Open Support (Q7.A) ---
function toSave() {
  hideMenu();
  var jpcode = window.frames["editFrame"].document.getElementById("editor_text").value;
  var customCode = $("textarea[name=customCode]").text();
  var pageConfig = $("textarea[name=pageConfig]").text();
  var titleMatch = jpcode.match(/^B:\\s*(.+)$/m);
  var fileName = (titleMatch ? titleMatch[1].trim() : '未命名简谱') + '.jps';

  var data = {
    id: 'local_' + Date.now(),
    name: fileName.replace('.jps', ''),
    code: jpcode,
    custom_code: customCode,
    page_config: pageConfig
  };

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  tip("文件已成功保存到本地！");
}

$(document).ready(function() {
  var fileInput = document.getElementById('localFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(evt) {
        var content = evt.target.result;
        try {
          var parsed = JSON.parse(content);
          if (parsed.code) {
            editorSetVal(parsed.code);
            if (parsed.custom_code) $("textarea[name=customCode]").text(parsed.custom_code);
            if (parsed.page_config) $("textarea[name=pageConfig]").text(parsed.page_config);
            setFileName(parsed.name || file.name.replace('.jps', ''));
          } else {
            editorSetVal(content);
          }
        } catch (err) {
          editorSetVal(content);
        }
        redraw(-1, 'openFile');
        tip("文件载入成功！");
      };
      reader.readAsText(file);
    });
  }

  $("#menuOpenFile").off('click').on('click', function() {
    hideMenu();
    var input = document.getElementById('localFileInput');
    if (input) input.click();
  });
});
`;

js += '\n' + localSaveOpenCode;
fs.writeFileSync('web/Zhipu-jsCode.js', js);
console.log('Successfully patched local renderer and local storage into web/!');
