/// <reference path="D:/Documents/OpenRCT2/OpenRCT2-PLUGIN-TESTS/openrct2.d.ts" />

// Written by spacek 4/16/2020

// positional types
class Dim2 {
    scale: number;
    offset: number;
    constructor(scale?: number, offset?: number) {
        scale = scale ? scale : 0;
        offset = offset ? offset : 0;
        this.scale = scale;
        this.offset = offset;
    }
    get x(): number {
        return this.scale;
    }
    get y(): number {
        return this.offset;
    }

    static add(a: Dim2, b: Dim2): Dim2 {
        return new Dim2(a.scale + b.scale, a.offset + b.offset);
    }
    static subtract(a: Dim2, b: Dim2): Dim2 {
        return new Dim2(a.scale - b.scale, a.offset - b.offset);
    }
    static negate(a: Dim2): Dim2 {
        return new Dim2(-a.scale, -a.offset);
    }
    static multiply(a: Dim2, b: Dim2): Dim2 {
        return new Dim2(a.scale * b.scale, a.offset * b.offset);
    }
    static equals(a: Dim2, b: Dim2): boolean {
        return a.scale == b.scale && a.offset == b.offset;
    }
    static multiplyNumber(a: Dim2, n: number): Dim2 {
        return new Dim2(a.scale * n, a.offset * n);
    }
}

class UDim2 {
    x: Dim2;
    y: Dim2;
    constructor(xScale?: number, xOffset?: number, yScale?: number, yOffset?: number) {
        xScale = xScale ? xScale : 0;
        xOffset = xOffset ? xOffset : 0;
        yScale = yScale ? yScale : 0;
        yOffset = yOffset ? yOffset : 0;
        this.x = new Dim2(xScale, xOffset);
        this.y = new Dim2(yScale, yOffset);
    }
    get scale(): Dim2 {
        return new Dim2(this.x.scale, this.y.scale);
    }
    get offset(): Dim2 {
        return new Dim2(this.x.offset, this.y.offset);
    }

    static add(a: UDim2, b: UDim2): UDim2 {
        return new UDim2(a.x.scale + b.x.scale, a.x.offset + b.x.offset, a.y.scale + b.y.scale, a.y.offset + b.y.offset);
    }
    static subtract(a: UDim2, b: UDim2): UDim2 {
        return new UDim2(a.x.scale - b.x.scale, a.x.offset - b.x.offset, a.y.scale - b.y.scale, a.y.offset - b.y.offset);
    }
    static negate(a: UDim2): UDim2 {
        return new UDim2(-a.x.scale, -a.x.offset, -a.y.scale, - a.y.offset);
    }
    static multiply(a: UDim2, b: UDim2): UDim2 {
        return new UDim2(a.x.scale * b.x.scale, a.x.offset * b.x.offset, a.y.scale * b.y.scale, a.y.offset * b.y.offset);
    }
    static multiplyNumber(a: UDim2, n: number): UDim2 {
        return new UDim2(a.x.scale * n, a.x.offset * n, a.y.scale * n, a.y.offset * n);
    }

}

// Widget class
function GetRandomCharacter() {
    return String.fromCharCode(context.getRandom(65, 65 + 25));
}

function GetRandomName() { // random ten letter alphabetic name
    return GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter() + GetRandomCharacter()
}

class BaseWidget {
    name: string;

    _type: string;
    _realName: string;
    _parent: BaseWidget;
    _children: BaseWidget[];
    _realWidget: Widget;
    _window: Window;

    _position: UDim2;
    _size: UDim2;
    _absoluteSize: Dim2;
    _windowPosition: Dim2; // absolute position, in window-space

    _padding: Dim2[];
    _absoluteCanvasSize: Dim2;
    _windowCanvasPosition: Dim2; // absolute position, in window-space

    _isDisabled: boolean;

    constructor() {
        this._realName = GetRandomName();
        this._position = new UDim2(0, 0, 0, 0);
        this._size = new UDim2(0, 0, 0, 0);
        this._windowPosition = new Dim2(0, 0);
        this._absoluteSize = new Dim2(0, 0);
        this._windowCanvasPosition = new Dim2(0, 0);
        this._absoluteCanvasSize = new Dim2(0, 0);
        this._isDisabled = false;
        this._padding = [new Dim2(0, 0), new Dim2(0, 0)];
    }
    get type(): string {
        return this._type;
    }
    get realName(): string {
        return this._realName;
    }

    get parent(): BaseWidget {
        return this._parent;
    }

    set position(position: UDim2) {
        this._position = position;
        this.drawSizeAndPosition();
    }
    get position(): UDim2 {
        return this._position;
    }

    set size(size: UDim2) {
        this._size = size;
        this.drawSizeAndPosition();
    }
    get size(): UDim2 {
        return this._size;
    }

    get windowPosition(): Dim2 {
        return this._windowPosition;
    }
    get absolutePosition(): Dim2 {
        if (this._window) {
            return new Dim2(this._windowPosition.x + this._window.x, this._windowPosition.y + this._window.y);
        } else {
            return this._windowPosition;
        }
    }

    get absoluteSize(): Dim2 {
        return this._absoluteSize;
    }

    get isDisabled(): boolean {
        return this._isDisabled;
    }
    set isDisabled(disabled: boolean) {
        this._isDisabled = disabled;
        if (this._realWidget) {
            this._realWidget.isDisabled = disabled;
        }
    }

    getChildren() {
        return this._children;
    }

    addChild(widget: BaseWidget) {
        this._children.push(widget);
        widget._parent = this;
        widget._window = this._window;
        widget.drawSizeAndPosition();
    }
    removeChild(widget: BaseWidget) {
        var index = this._children.indexOf(widget);
        if (index >= 0) {
            widget._children.splice(index, 1);
        }
        widget._parent = null;
        widget._window = null;
    }

    drawSizeAndPosition() {
        if (this._parent) {
            this._absoluteSize = Dim2.add(this._size.offset, Dim2.multiply(this._parent._absoluteCanvasSize, this._size.scale));
            this._windowPosition = Dim2.add(Dim2.add(this._parent._windowCanvasPosition, this._position.offset), Dim2.multiply(this._parent._absoluteCanvasSize, this._position.scale));
        } else {
            this._absoluteSize = this._size.offset;
            this._windowPosition = this._position.offset;
        }
        this._absoluteCanvasSize = Dim2.subtract(Dim2.subtract(this._absoluteSize, this._padding[0]), this._padding[1]);
        this._windowCanvasPosition = Dim2.add(this._windowPosition, this._padding[0]);

        for (var i = 1; i < this._children.length; i++) {
            this._children[i].drawSizeAndPosition();
        }

        if (this._realWidget) {
            this._realWidget.x = this._windowPosition.x;
            this._realWidget.y = this._windowPosition.y;
            this._realWidget.width = this._absoluteSize.x;
            this._realWidget.height = this._absoluteSize.y;
        }
    }
}

/*

// colors
let COLORS_BY_NAME = [
    "black", "grey", "white", "dark_purple", "light_purple", "bright_purple", "dark_blue", "light_blue",
    "icy_blue", "teal", "aquamarine", "saturated_green", "dark_green", "moss_green", "bright_green", "olive_green",
    "dark_olive_green", "bright_yellow", "yellow", "dark_yellow", "light_orange", "dark_orange", "light_brown", "saturated_brown",
    "dark_brown", "salmon_pink", "bordeaux_red", "saturated_red", "bright_red", "dark_pink", "bright_pink", "light_pink",
]

class Color {
    id: number;
    name: string;
    constructor(param: number | string) {
        if (typeof (param) == "number") {
            this.id = Math.floor(param % 32);
            this.name = COLORS_BY_NAME[this.id];
        } else if (typeof (param) == "string") {
            this.id = COLORS_BY_NAME.indexOf(param);
            if (this.id >= 0) {
                this.name = param;
            } else {
                this.id = 0;
                this.name = COLORS_BY_NAME[0];
            }
        } else {
            this.id = 0;
            this.name = COLORS_BY_NAME[0];
        }
    }
}
_headerColor: Color;
_backgroundColor: Color;
_textColor: Color;
        this._headerColor = new Color(1);
        this._backgroundColor = new Color(1);
        this._textColor = new Color(2);
drawColors() {
    if (this._realWidget) {
        //this._realWidget.colour = [this._headerColor.id, this._backgroundColor.id, this._textColor.id];
    }
}
*/




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

