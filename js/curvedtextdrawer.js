/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */


/**
 * CurvedTextDrawer is an utility that allows you to draw text around
 * circle's circumference. The drawing will be targeted to canvas element.
 *
 * @param   canvasElem          The canvas element from DOM.
 * @return  New CurvedTextDrawer instance.
 */
CurvedTextDrawer = function(canvasElem) {
    console.log("--> new CurvedTextDrawer()");
    this.canvasElem = canvasElem;
    this.backgroundFill = "";
    this.useFont = "30px Arial";
    this.textColor = "black";
   
    /**
     * Returns the center point of given canvas.
     * @return  Canvas' center point as Vec2 object.
     */
    this.getCanvasCenterPos = function() {
        return new Vec2(this.canvasElem.width/2, this.canvasElem.height/2);
    }
    
    /**
     * Clears the canvas with color set to his.backgroundFill. If that member is
     * an empty string, this function does nothing.
     */
    this.clearCanvas = function() {
        var ctx = this.canvasElem.getContext("2d");
        if (this.backgroundFill.length > 0) {
            ctx.fillStyle = this.backgroundFill;
            ctx.fillRect(0, 0, this.canvasElem.width, this.canvasElem.height);
        }
    }
    
    /**
     * Draws the on given arch. You can specify the beginning position of the arch and
     * the maximum angle the text travels on the arch.
     * @param   text            The text to be printed.
     * @param   centerX         Center X of the text.
     * @param   centerY         Center Y of the text.
     * @param   radius          Radius of the circumference in pixels.
     * @param   begAngle        Rotation of the first character. 0 means the character is
     *                          on top of the circle, 180 means the text starts from the
     *                          bottom of the circle.
     * @param   maxRotation     Maximum number of degress the text goes on the circle arch.
     * @param   dir             Rotation direction. Use 'cs' for text that circles clockwise and
     *                          'ccw' string for counter-clockwise rotation of the text.
     * @param   flipVertically  Pass true if upper edge of the character is closer to the
     *                          circle's origin. Pass false if lower edge of the character is closer
     *                          to the circle's origin.
     * @param   align           Text align inside the given arch. Use strings 
     *                          'left', 'right', 'center' and 'justify'.
     */
    this.drawSectorArc = function(text, centerX, centerY, radius, begAngle, maxRotation, dir, flipVertically, align) {
        console.log("--> CurvedTextDrawer.drawSectorArc()");
        var ctx = this.canvasElem.getContext("2d");
        this.clearCanvas();
        
        // Set up font and other text parameters.
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = this.useFont;
        ctx.fillStyle = this.textColor;
        
        // Check the text rotation direction.
        var dirMultiplier = 0;
        if (dir == "cw") {
            dirMultiplier = 1;
        } else if (dir == "ccw") {
            dirMultiplier = -1;
        }
        
        // Check text positioning inside the arc.
        var maxRotRads = degs2Rads(maxRotation);
        var textLen = ctx.measureText(text).width;
        var pix2AngleFactor = 0;
        var angle = degs2Rads(begAngle);
        
        console.log("    align: " + align);
        if (align == "left") {
            var arcLen = (maxRotRads * Math.PI * radius) / Math.PI;
            pix2AngleFactor = maxRotRads / arcLen;
            
        } else if (align == "right") {
            var arcLen = (maxRotRads * Math.PI * radius) / Math.PI;
            pix2AngleFactor = maxRotRads / arcLen;
            angle = clampRotationValue(angle + maxRotRads - (textLen * pix2AngleFactor),
                                       'rads');
            
        } else if (align == "center") {
            var arcLen = (maxRotRads * Math.PI * radius) / Math.PI;
            pix2AngleFactor = maxRotRads / arcLen;
            var halfCharWidths = ctx.measureText(text[0]).width / 2;
            halfCharWidths += ctx.measureText(text[text.length-1]).width / 2;
            angle = clampRotationValue(angle + ((textLen - halfCharWidths) / 2.0) * pix2AngleFactor, 'rads');
            
        } else if (align == "justify") {
            // The text will occupy the whole arch section.
            pix2AngleFactor = degs2Rads(maxRotation) / textLen;
        }
        
        
        // Draw the circular text.
        var centerPos = new Vec2(centerX, centerY);
        for (var i = 0; i < text.length; ++i) {
            var c = text[i];
            var charPos = calcPosOnCircumference(angle, centerPos, radius);
            
            ctx.save();
            ctx.translate(charPos.mX, charPos.mY);
            if (flipVertically) {
                ctx.rotate(angle + Math.PI);
            } else {
                ctx.rotate(angle);
            }
            ctx.fillText(c, 0, 0);
            ctx.restore();
            
            var charWidth = ctx.measureText(c).width / 2;
            if (i+1 < text.length) {
                charWidth += ctx.measureText(text[i+1]).width / 2;
            }
            
            console.log("    char: " + c + ", w:" + charWidth + ", angle: " + (charWidth * pix2AngleFactor * dirMultiplier));
            angle += (charWidth * pix2AngleFactor * dirMultiplier);
            if (angle >= 2 * Math.PI) {
                angle -= 2 * Math.PI;
            }
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
        }
        console.log("<-- CurvedTextDrawer.drawSectorArc()");
    }
    
    /**
     * Calculates the position from circle's circumference. Zero rotation means
     * point (0, -radius) relative to given center position.
     * @param   angle           Amount of rotation.
     * @param   centerPos       Circle's center position as Vec2 object.
     * @param   radius          Radius of the circle.
     * @return  Point from circumference.
     */
    function calcPosOnCircumference(angle, centerPos, radius) {
        var pointPos = new Vec2(0, -radius);
        pointPos.rotate(angle);
        pointPos.add(centerPos);
        return pointPos;
    }
    
    return this;
}
