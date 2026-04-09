// app.js
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

function getNearestColor(r, g, b, paletteArray) {
    let bestMatch = null;
    let minDistance = Infinity;
    for (let item of paletteArray) {
        let [pr, pg, pb] = hexToRgb(item.color);
        let dist = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);
        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = { ...item, rgb: [pr, pg, pb] };
        }
    }
    return bestMatch;
}

function render() {
    const paletteKey = document.getElementById('paletteSelect').value;
    const currentPalette = window.allPalettes.get(paletteKey);
    const gridSize = parseInt(document.getElementById('gridSize').value);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = false;
    canvas.width = canvas.height = 800;
    const cellSize = 800 / gridSize;
    const counts = {};
    const file = document.getElementById('upload').files[0];
    if (!file) return alert("请上传图片");

    const img = new Image();
    img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gridSize; tempCanvas.height = gridSize;
        tempCanvas.getContext('2d').drawImage(img, 0, 0, gridSize, gridSize);
        const data = tempCanvas.getContext('2d').getImageData(0, 0, gridSize, gridSize).data;
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,800,800);
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                let i = (y * gridSize + x) * 4;
                if (data[i+3] < 128) continue;
                let match = getNearestColor(data[i], data[i+1], data[i+2], currentPalette);
                counts[match.name] = (counts[match.name] || 0) + 1;
                ctx.fillStyle = match.color;
                ctx.fillRect(Math.floor(x*cellSize)+1, Math.floor(y*cellSize)+1, cellSize-2, cellSize-2);
            }
        }
        let html = "<h3>统计清单</h3>";
        for (let name in counts) {
            let colorObj = currentPalette.find(c => c.name === name);
            html += `<div style="margin-bottom:5px;"><span style="display:inline-block;width:15px;height:15px;background:${colorObj.color};margin-right:5px;"></span> ${name}: ${counts[name]}</div>`;
        }
        document.getElementById('stats').innerHTML = html;
    };
    img.src = URL.createObjectURL(file);
}
