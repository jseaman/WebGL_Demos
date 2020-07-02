"use strict";

function Shape() 
{
	this.name = "";
	this.location = vec3(0,0,0);
	this.theta = vec3(0,0,0);
	this.scale = vec3(1,1,1);
	this.objTopColor = vec4(0,0,0,0);
	this.objBottomColor = vec4(0,0,0,0);
	this.linesTopColor = vec4(0,0,0,0);
	this.linesBottomColor = vec4(0,0,0,0);
	this.perspective = mult(perspective(90.0,1.0,0.1,8.0),lookAt(vec3(0,0,2), vec3(0,0,0) , vec3(0,1,0)));
	
	this.render = function () 
	{
		gl.uniform3fv(Shape.thetaLoc, this.theta);
		gl.uniform3fv(Shape.locationLoc, this.location);
		gl.uniform3fv(Shape.scaleLoc, this.scale);
		gl.uniformMatrix4fv(Shape.perspectiveLoc,false,flatten(this.perspective));
	}
}

Cone.prototype = new Shape();
Cone.prototype.constructor=Cone;

function Cone ()
{
	if (typeof Cone.vBuffer==='undefined' || Cone.vBuffer==null)
	{
		Cone.npoints = 15;
		
		console.log("creando geometria del cone");
		
		var vertices = [vec3(0,-1,0)];
		var indices = [0];
		
		var delta = 2*Math.PI/Cone.npoints;
		
		var i=0,ang=0;
		
		for (i=1,ang=0;i<=Cone.npoints;i++,ang+=delta)
		{
			vertices.push(vec3(Math.cos(ang),-1,Math.sin(ang)));
			indices.push(i);
		}
		
		indices.push(1);
		
		// to the top	
		
		vertices.push(vec3(0,1,0));	
		var top_vertex = vertices.length-1;
		indices.push(top_vertex);
		
		for (i=1;i<=Cone.npoints;i++)
			indices.push(i);
			
		indices.push(1);
		
		for (i=1;i<=Cone.npoints;i++)
		{		
			indices.push(i);
			indices.push(top_vertex);
		}
		
		Cone.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cone.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

		// Load the data into the GPU

		Cone.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cone.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
		
		Cone.vPosition = gl.getAttribLocation( program, "vPosition" );
	}
	
	this.render = function ()
	{
		this.constructor.prototype.render.call(this);
		console.log("Rendereando cono...");
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cone.iBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, Cone.vBuffer );
		
		gl.vertexAttribPointer( Cone.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cone.vPosition );
	
		gl.uniform4fv(Shape.bottomColorLoc, this.objBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.objTopColor);
		
		gl.drawElements( gl.TRIANGLE_FAN, Cone.npoints+2, gl.UNSIGNED_SHORT, 0 );
		gl.drawElements( gl.TRIANGLE_FAN, Cone.npoints+2, gl.UNSIGNED_SHORT, (Cone.npoints+2)*2 );
		
		gl.uniform4fv(Shape.bottomColorLoc, this.linesBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.linesTopColor);
		
		gl.drawElements(gl.LINE_LOOP, Cone.npoints, gl.UNSIGNED_SHORT, 2);
		gl.drawElements( gl.LINE_STRIP, Cone.npoints*2, gl.UNSIGNED_SHORT, (Cone.npoints+2)*4 );
	}
}

Cylinder.prototype = new Shape();
Cylinder.prototype.constructor=Cylinder;

function Cylinder ()
{
	if (typeof Cylinder.vBuffer==='undefined' || Cylinder.vBuffer==null)
	{
		console.log("creando geometria del cylinder");
		
		Cylinder.npoints = 25;
		
		var vertices = [vec3(0,-1,0)];
		var indices = [0];
		
		var delta = 2*Math.PI/Cylinder.npoints;
		
		var i=0,ang=0;
		
		// bottom lid
		
		for (i=1,ang=0;i<=Cylinder.npoints;i++,ang+=delta)
		{
			vertices.push(vec3(Math.cos(ang),-1,Math.sin(ang)));
			indices.push(i);
		}
		
		indices.push(1);
		
		// top lid
		vertices.push(vec3(0,1,0));
		indices.push(vertices.length-1);
		
		var first_top_index = indices.length;
		
		console.log(first_top_index);
		
		for (i=1,ang=0;i<=Cylinder.npoints;i++,ang+=delta)
		{
			vertices.push(vec3(Math.cos(ang),1,Math.sin(ang)));
			indices.push(vertices.length-1);
		}
		
		indices.push(indices[first_top_index]);
		
		// sides
		
		var bot,top;
		
		for (bot=1,top=bot+Cylinder.npoints+1;bot<=Cylinder.npoints;top++,bot++)
		{
			indices.push(bot);
			indices.push(top);
		}
		
		indices.push(1);
		indices.push(Cylinder.npoints+2);
		
		// array element buffer

		Cylinder.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

		// Load the data into the GPU

		Cylinder.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

		// Associate out shader variables with our data buffer

		Cylinder.vPosition = gl.getAttribLocation( program, "vPosition" );
	}
	
	this.render = function () 
	{
		this.constructor.prototype.render.call(this);
		console.log("Rendereando cilindro...");
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder.iBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.vBuffer );
		
		gl.vertexAttribPointer( Cylinder.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cylinder.vPosition );
		
		gl.uniform4fv(Shape.bottomColorLoc, this.objBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.objTopColor);
		
		gl.drawElements( gl.TRIANGLE_FAN, Cylinder.npoints+2, gl.UNSIGNED_SHORT, 0 );
		gl.drawElements( gl.TRIANGLE_FAN, Cylinder.npoints+2, gl.UNSIGNED_SHORT, (Cylinder.npoints+2)*2 );
		
		gl.drawElements( gl.TRIANGLE_STRIP, Cylinder.npoints*2+2, gl.UNSIGNED_SHORT, (Cylinder.npoints+2)*4 );
		
		gl.uniform4fv(Shape.bottomColorLoc, this.linesBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.linesTopColor);
		
		gl.drawElements( gl.LINE_STRIP, Cylinder.npoints+2, gl.UNSIGNED_SHORT, 2 );
		gl.drawElements( gl.LINE_STRIP, Cylinder.npoints+2, gl.UNSIGNED_SHORT, 2 + (Cylinder.npoints+2)*2 );
		gl.drawElements( gl.LINES, Cylinder.npoints*2+2, gl.UNSIGNED_SHORT, (Cylinder.npoints+2)*4 );
	}
}

Sphere.prototype = new Shape();
Sphere.prototype.constructor=Sphere;

function Sphere ()
{
	if (typeof Sphere.vBuffer==='undefined' || Sphere.vBuffer==null)
	{
		console.log("creando geometria del sphere");
		
		Sphere.npoints = 25;
		
		var vertices = [];
		var indices = [];
		
		var lon;
		var lonDist = 2*Math.PI/Sphere.npoints;
		
		var lat;
		var latDist = 2/Sphere.npoints;
		
		var i,j;
		
		for (i=1,lat=1-latDist/2;i<=Sphere.npoints;i++,lat-=latDist)
		{
			for (j=1,lon=0;j<=Sphere.npoints;j++,lon+=lonDist)
			{
				var factor = Math.sqrt(1-lat*lat);				
				vertices.push(vec3(factor*Math.cos(lon),lat,factor*Math.sin(lon)));
				indices.push(vertices.length-1);
			}
		}
		
		// create triangle strips
		
		for (i=0;i<Sphere.npoints-1;i++)
		{
			for (j=0;j<Sphere.npoints;j++)
			{
				var topIndex = i*Sphere.npoints + j;
				var bottomIndex = (i+1)*Sphere.npoints + j;
				
				indices.push(topIndex);
				indices.push(bottomIndex);
			}
			
			indices.push(i*Sphere.npoints);
			indices.push((i+1)*Sphere.npoints);
		}
		
		// top lid
		
		vertices.push(vec3(0,1,0));
		indices.push(vertices.length-1);
		
		for (i=0;i<Sphere.npoints;i++)
			indices.push(i);
			
		indices.push(0);
		
		// bottom lid
		
		vertices.push(vec3(0,-1,0));
		indices.push(vertices.length-1);
		
		var first = Sphere.npoints*(Sphere.npoints-1);
		
		for (i=0;i<Sphere.npoints;i++)
			indices.push(first+i);
			
		indices.push(first);
		
		// latitude lines		
		
		for (i=0;i<Sphere.npoints;i++)
		{
			indices.push(i);
			
			for (j=1;j<Sphere.npoints;j++)
				indices.push(i+j*Sphere.npoints);
		}
		
		// array element buffer

		Sphere.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

		// Load the data into the GPU

		Sphere.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

		// Associate out shader variables with our data buffer

		Sphere.vPosition = gl.getAttribLocation( program, "vPosition" );
	}
	
	this.render = function ()
	{
		this.constructor.prototype.render.call(this);
		console.log("Rendereando esfera...");
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.iBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.vBuffer );
		
		gl.vertexAttribPointer( Sphere.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vPosition );
		
		gl.uniform4fv(Shape.bottomColorLoc, this.objBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.objTopColor);
		
		var i;
	
		for (i=0;i<Sphere.npoints-1;i++)
			gl.drawElements( gl.TRIANGLE_STRIP, Sphere.npoints*2+2, gl.UNSIGNED_SHORT, (Sphere.npoints*Sphere.npoints + i*(Sphere.npoints*2+2))*2);
		
		var poleOffset = (Sphere.npoints*Sphere.npoints + (Sphere.npoints-1)*(Sphere.npoints*2+2));
		gl.drawElements( gl.TRIANGLE_FAN, Sphere.npoints+2, gl.UNSIGNED_SHORT, poleOffset*2);
		gl.drawElements( gl.TRIANGLE_FAN, Sphere.npoints+2, gl.UNSIGNED_SHORT, (poleOffset+Sphere.npoints+2)*2);
			
		gl.uniform4fv(Shape.bottomColorLoc, this.linesBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.linesTopColor);
		
		for (i=0;i<Sphere.npoints;i++)
			gl.drawElements( gl.LINE_LOOP, Sphere.npoints, gl.UNSIGNED_SHORT, i*Sphere.npoints*2);
			
		for (i=0;i<Sphere.npoints;i++)
		{
			var offset = (poleOffset+(Sphere.npoints+2)*2+i*Sphere.npoints)*2;
			gl.drawElements( gl.LINE_STRIP, Sphere.npoints, gl.UNSIGNED_SHORT, offset);
		}
	}
}

var gl;
var program;

var selectedShape = null;
var shapes = [];

var coneCount = 0;
var cylinderCount = 0;
var sphereCount = 0;

function initShape(newShape, objTopColor, objBottomColor)
{
	newShape.scale = vec3(0.3,0.3,0.3);
	newShape.linesTopColor = vec4(1,1,0,1);
	newShape.linesBottomColor = vec4(1,1,0,1);
	newShape.objTopColor = objTopColor;
	newShape.objBottomColor = objBottomColor;
	shapes.push(newShape);

	if (selectedShape!=null)
	{
		selectedShape.linesTopColor = vec4(1,1,1,1);
		selectedShape.linesBottomColor = vec4(1,1,1,1);
	}

	selectedShape = newShape;
	setSliderValues(newShape);
}

function setSliderValues (shape)
{
	document.getElementById("RotXSlider").value = shape.theta[0];
	document.getElementById("RotYSlider").value = shape.theta[1];
	document.getElementById("RotZSlider").value = shape.theta[2];

	document.getElementById("TransXSlider").value = shape.location[0];
	document.getElementById("TransYSlider").value = shape.location[1];
	document.getElementById("TransZSlider").value = -shape.location[2];

	document.getElementById("ScaleXSlider").value = shape.scale[0];
	document.getElementById("ScaleYSlider").value = shape.scale[1];
	document.getElementById("ScaleZSlider").value = shape.scale[2];
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 0.9, 1.0, 1.0 );
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );	
	
	Shape.thetaLoc = gl.getUniformLocation(program, "theta");
	Shape.locationLoc = gl.getUniformLocation(program, "location");
	Shape.scaleLoc = gl.getUniformLocation(program, "scale");
	
	Shape.bottomColorLoc = gl.getUniformLocation(program, "bottomColor");
	Shape.topColorLoc = gl.getUniformLocation(program, "topColor");

	Shape.perspectiveLoc = gl.getUniformLocation(program, "perspective");
	
	document.getElementById("ConeButton").onclick = function(event)
	{
		var newCone = new Cone();
		newCone.name = "Cone"+(++coneCount);
		initShape(newCone,vec4(1,0,0,1),vec4(0,0,0,1));

		render();
		
		document.getElementById("TransformDiv").style.display = 'block';
	}

	document.getElementById("CylinderButton").onclick = function(event)
	{
		var newCylinder = new Cylinder();
		newCylinder.name = "Cylinder"+(++cylinderCount);
		initShape(newCylinder,vec4(0,1,0,1),vec4(0,0,0,1));

		render();

		document.getElementById("TransformDiv").style.display = 'block';
	}

	document.getElementById("SphereButton").onclick = function(event)
	{
		var newSphere = new Sphere();
		newSphere.name = "Sphere"+(++sphereCount);
		initShape(newSphere,vec4(0,0,1,1),vec4(0,0,0,1));

		render();

		document.getElementById("TransformDiv").style.display = 'block';
	}

	document.getElementById("RotXSlider").onmousemove = function(event)
	{
		selectedShape.theta = 
			vec3(
				event.srcElement.value,
				selectedShape.theta[1],
				selectedShape.theta[2]
				);

		render();
	}

	document.getElementById("RotYSlider").onmousemove = function(event)
	{
		selectedShape.theta = 
			vec3(
				selectedShape.theta[0],
				event.srcElement.value,				
				selectedShape.theta[2]
				);

		render();
	}

	document.getElementById("RotZSlider").onmousemove = function(event)
	{
		selectedShape.theta = 
			vec3(
				selectedShape.theta[0],
				selectedShape.theta[1],
				event.srcElement.value				
				);

		render();
	}

	document.getElementById("TransXSlider").onmousemove = function(event)
	{
		selectedShape.location = 
			vec3(
				event.srcElement.value,
				selectedShape.location[1],
				selectedShape.location[2]
				);

		render();
	}

	document.getElementById("TransYSlider").onmousemove = function(event)
	{
		selectedShape.location = 
			vec3(
				selectedShape.location[0],
				event.srcElement.value,
				selectedShape.location[2]
				);

		render();
	}

	document.getElementById("TransZSlider").onmousemove = function(event)
	{
		selectedShape.location = 
			vec3(
				selectedShape.location[0],
				selectedShape.location[1],
				-event.srcElement.value
				);

		render();
	}

	document.getElementById("ScaleXSlider").onmousemove = function(event)
	{
		selectedShape.scale =
			vec3(
				event.srcElement.value,
				selectedShape.scale[1],
				selectedShape.scale[2]
				);

		render();
	}

	document.getElementById("ScaleYSlider").onmousemove = function(event)
	{
		selectedShape.scale =
			vec3(
				selectedShape.scale[0],
				event.srcElement.value,
				selectedShape.scale[2]
				);

		render();
	}

	document.getElementById("ScaleZSlider").onmousemove = function(event)
	{
		selectedShape.scale =
			vec3(				
				selectedShape.scale[0],
				selectedShape.scale[1],
				event.srcElement.value
				);

		render();
	}
	
    render();
};


function render() {
	console.log("rendering "+shapes.length+" shapes");
    gl.clear( gl.COLOR_BUFFER_BIT ); 

    for (var i=0;i<shapes.length;i++)
    {
    	console.log("rendering "+shapes[i].name);
    	shapes[i].render();
    }

}
