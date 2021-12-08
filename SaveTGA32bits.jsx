//SaveTGA32bits v1.0
//2021.12.08 Created by JuitingFan
//2021.12.08 Last edited by JuitingFan
//安裝路徑: .\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts
//使用說明: 
//  1) 將需要顯示的內容放到同一個圖層群組內
//  2) 圖層群組命名=檔名
//  3) 將該圖層群組移到所有圖層的最上層
//  4) 關閉所有不須顯示的圖層
//  5) 點選要存的圖層群組(只能單選)並執行SaveTGA32bits.jsx
//  6) 檔案會自動存到psd檔所在路徑

var doc= app.activeDocument;
var orgLayerSet = doc.activeLayer;
var titleName=orgLayerSet.name;


//複製原始圖層群組，合併複製群組，並選取合併後的圖層做為Alpha參照
orgLayerSet.duplicate(orgLayerSet,ElementPlacement.PLACEBEFORE);
var copyLayerSet = doc.layerSets[0];
copyLayerSet.merge();
var copyLayer = doc.layers[0];
doc.activeLayer = copyLayer;


//去除現有AlphaChannel，新增一個空白AlphaChannel
doc.channels.removeAll();
var channelRef=doc.channels.add();


//選取圖層不透明範圍
//來源: https://stackoverflow.com/questions/17531731/setting-selection-to-layer-transparency-channel-using-extendscript-in-photoshop
function SelectTransparency()
{
    var idChnl = charIDToTypeID( "Chnl" );
 
    var actionSelect = new ActionReference();
    actionSelect.putProperty( idChnl, charIDToTypeID( "fsel" ) );    
 
    var actionTransparent = new ActionReference();    
    actionTransparent.putEnumerated( idChnl, idChnl, charIDToTypeID( "Trsp" ) );
 
    var actionDesc = new ActionDescriptor();
    actionDesc.putReference( charIDToTypeID( "null" ), actionSelect );
    actionDesc.putReference( charIDToTypeID( "T   " ), actionTransparent );
 
    executeAction( charIDToTypeID( "setd" ), actionDesc, DialogModes.NO );
}


//填滿白色到AlphaChannel
var myColor = new SolidColor();  
myColor.rgb.red = 255;  
myColor.rgb.green = 255;  
myColor.rgb.blue = 255;
SelectTransparency(copyLayer);
doc.selection.fill(myColor);
doc.selection.deselect();


//複製合併多次，製作底圖，預設複製10次
for ( i = 0 ; i < 10 ; i ++ ) {
    doc.layers[0].duplicate(doc.layers[0],ElementPlacement.PLACEBEFORE);
    doc.layers[0].merge();
}
 
 
//移動圖層
//來源:https://community.adobe.com/t5/photoshop-ecosystem-discussions/photoshop-script-to-shift-layer-up-or-down-relative-to-activelayer/td-p/11798574
function moveLayerRelativeStack(relPos) {
    var c2t = function (s) {
        return app.charIDToTypeID(s);
    };
    var s2t = function (s) {
        return app.stringIDToTypeID(s);
    };
    var descriptor = new ActionDescriptor();
    var reference = new ActionReference();
    var reference2 = new ActionReference();
    reference.putEnumerated( s2t( "layer" ), s2t( "ordinal" ), s2t( "targetEnum" ));
    descriptor.putReference( c2t( "null" ), reference );
    reference2.putEnumerated( s2t( "layer" ), s2t( "ordinal" ), s2t( relPos ));
    descriptor.putReference( s2t( "to" ), reference2 );
    executeAction( s2t( "move" ), descriptor, DialogModes.NO );
}

//墊底圖層移到最底
for ( j = 0 ; j < doc.layers.length ; j ++ ) {
    moveLayerRelativeStack("previous");
}


//存檔，使用圖層名稱作為檔名
//來源: https://community.adobe.com/t5/photoshop-ecosystem-discussions/looking-for-a-save-as-targa-script/m-p/9511003
main();
function main(){
 
    if(!documents.length) return;
 
    var Name = app.activeDocument.name.replace(/\.[^\.]+$/, '');
    Name = Name.replace(/\d+$/,'');
    Name = Name.replace(/_$/,'');
 
    try{
    var savePath = activeDocument.path;
    }catch(e){
        alert("請先儲存此psd檔");
        }

    var saveFile = File(savePath + "/" + titleName + ".tga");
    saveTarga32(saveFile);
}

 
function saveTarga32(saveFile){
    targaSaveOptions = new TargaSaveOptions();
    targaSaveOptions.alphaChannels = true;
    targaSaveOptions.resolution = TargaBitsPerPixels.THIRTYTWO;
    activeDocument.saveAs(File(saveFile), targaSaveOptions, true, Extension.LOWERCASE);
};
 

//刪除Alpha與墊底圖層
doc.channels.removeAll();
doc.activeLayer.remove();

//官方Photoshop CS6 JavaScript Reference
//https://www.adobe.com/content/dam/acom/en/devnet/photoshop/scripting/Photoshop-CS6-JavaScript-Ref.pdf

//圖層序列教學
//https://community.adobe.com/t5/photoshop-ecosystem-discussions/accessing-all-the-layers-in-all-the-layer-sets/td-p/10392739