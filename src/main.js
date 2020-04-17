// Written by spacek 4/16/2020

// Dim2 Class
var Dim2 = function (x, y){
    if (x == null) {
        this.x = 0;
        this.y = 0;
    } else if (y == null) {
        this.x = x;
        this.y = x;
    } else {
        this.x = x;
        this.y = y;
    }
}

Dim2.prototype.add1 = function(b) {
    return Dim2(this.x + b, this.y + b);
}
Dim2.prototype.sub1 = function(b) {
    return Dim2(this.x - b, this.y - b);
}
Dim2.prototype.mult1 = function(b) {
    return Dim2(this.x * b, this.y * b);
}

Dim2.prototype.equals1 = function(b) {
    return this.x == b && this.y == b;
}

Dim2.prototype.add2 = function(b) {
    return Dim2(this.x + b.x, this.y + b.y);
}
Dim2.prototype.sub2 = function(b) {
    return Dim2(this.x - b.x, this.y - b.y);
}
Dim2.prototype.mult2 = function(b) {
    return Dim2(this.x * b.x, this.y * b.y);
}

Dim2.prototype.equals2 = function(b) {
    return this.x == b.x && this.y == b.y;
}

// Widget class
var Widget = function(){
    this.name = "Widget";
    this.type = "widget";
    this.padding = {min : Dim2(), max: Dim2()};
    this.position = Dim2();
    this.size = Dim2();
    this.isDisabled = false;
    this.widgets = [];
    this._absoluteSize = Dim2();
    this._absolutePosition = Dim2();
    this.parent = null;
}

Widget.prototype.pack = function(widget) {
    this.widgets.push(widget);
    widget.parent = this;
}

Widget.__defineSetter__(
    'position',
    function(val){
        this.position = val;
        this.getAbsolutePosition();
    }
)

Widget.__defineSetter__(
    'absoluteSize',
    function() {
        return this._absoluteSize;
    }
)

Widget.__defineSetter__(
    'size',
    function(val){
        this.size = val;
        this.absoluteSize = val;
    }
)

Widget.__defineGetter__(
    'absolutePosition',
    function() {
        return this._absolutePosition;
    }
)

Widget.prototype.getAbsoluteSize = function() {
    return this.size;
}

Widget.prototype.getAbsolutePosition = function() {
    if (this.parent) {
        this._absolutePosition = this.parent.getAbsolutePosition().add2(this.position);
        return this._absolutePosition;
    } else {
        return this.position;
    }
}

Widget.prototype.childSizeChanged = function(widget) {
    this.getAbsoluteSize();
}

Widget.prototype.getHierarchy = function(arr) {
    if (arr == nil) {
        arr = [];
    };
    arr.push(this);
    for (var i = 0; this.widgets.length; i++) {
        this.widgets[i].getHierarchy(arr)
    }
    return arr;
}

var groupBox = function() {
    Widget.call(this,"groupBox");
}

var hBox = function(name) {
    Widget.call(this,name);
}
hBox.prototype = Object.create(Widget.prototype);
hBox.prototype.constructor = hBox;

var vBox = function(name) {
    Widget.call(this,name);
}
vBox.prototype = Object.create(Widget.prototype);
vBox.prototype.constructor = vbox;


var FlagBox = function(name,valueChangedFunction){
    this.name = "flagbox " + name;
    this.text = name;
    this.type = "groupbox";
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.isDisabled = false;
    this.storedValue = 0;
    this.columns = 1;
    this.checkBoxHeight = 12;
    this.widgets = [];
    this.padding = [5,12,-3,-3];
    this.valueChanged = valueChanged;
}
    
FlagBox.prototype.updateChildren = function() {
    var rows = Math.ceil(this.widgets.length / this.columns);
    this.height = rows * this.checkBoxHeight + this.padding[1] - this.padding[3];
    for (var i = 0; i < this.widgets.length; i++) {
        var checkBox = this.widgets[i];
        checkBox.height = this.checkBoxHeight;
        checkBox.width = Math.floor((this.width - this.padding[0] + this.padding[2])/this.columns);
        checkBox.x = this.x + this.padding[0] + (i % this.columns) * checkBox.width;
        checkBox.y = this.y + this.padding[1] + Math.floor(i/this.columns) * this.checkBoxHeight;
    }
}



function FlagBox(name,valueChanged) {
    
}

function flagBoxAddFlag(flagBox, name, value, startsChecked) {
    this.name = flagBox.name + ' checkbox ' + name;
    this.text = name;
    this.value = value;
    this.type = "checkbox";
    this.isChecked = startsChecked ? 1 : 0;
    flagBox.storedValue += 1 << (value * this.isChecked);
    this.onChanged = function(isChecked) {
        if (isChecked) {
            flagBox.storedValue += (1 << value)
        } else {
            flagBox.storedValue -= (1 << value)
        }
        console.log("flag box changed",flagBox.storedValue,flagBox.valueChanged);
        flagBox.valueChanged(flagBox.storedValue);
    }
    flagBox.widgets.push(this)
}

function flagBoxUpdateChildren(flagBox) {
    
}

function flagBoxSetValue(flagBox,value) {
    flagBox.storedValue = value;
    for (var i = 0; i < flagBox.widgets.length; i++) {
        flagBox.widgets[i].isChecked = flagBox.storedValue & (1 << flagBox.widgets[i].value);
    }
}

function flagBoxSetPosition(flagBox,x,y) {
    
}

function flagBoxSetSize(flagBox, width, height) {
    
}
function flagBoxAddToWidgets(flagBox) {
    
}
/*
Widget.prototype.getAbsoluteSize = function() {
    var min = {x:0, y:0};
    var max = {x:0, y:0};
    for (var i = 0; i < this.widgets.length; i++) {
        var wMin = this.widgets[i].position;
        var wMax = this.widgets[i].position.add2(this.widgets[i].size);
        if (wMin.x < min.x) {wMin.x = min.x;}
        if (wMin.y < min.y) {wMin.y = min.y;}
        if (wMax.x < max.x) {wMax.x = max.x;}
        if (wMax.y < max.y) {wMax.y = max.y;}
    }
    if (!max.subt2(min).equals(this.absoluteSize)) {
        this.absoluteSize = max.sub2(min);
    }
    if (this.parent && this.parent.childSizeChanged) {
        this.parent.childSizeChanged(this);
    }
}
*/


var main = function () {}

registerPlugin({
    name: 'RCT_k3',
    version: '1.0',
    authors: ['Spacek'],
    type: 'local',
    main: main
});
