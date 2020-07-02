"use strict";

// light
		
var lightPosition = vec4(0, 0, 0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

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
	this.lookAtMatrix = lookAt(vec3(0,0,2), vec3(0,0,0) , vec3(0,1,0));
	this.modelViewMatrix = mat4();
	this.projectionMatrix = perspective(90.0,800.0/600.0,0.1,8.0);
	this.normalMatrix = mat4();
	this.material = 
	{
		ambient : vec4( 1.0, 0.0, 1.0, 1.0 ),
		diffuse : vec4( 1.0, 0.8, 0.0, 1.0 ),
		specular : vec4( 1.0, 1.0, 1.0, 1.0 ),
		shininess : 50
	};

	
	this.render = function () 
	{				
		this.modelViewMatrix = 			
			mult(
				mult(
					mult(
						mult(
							mult(this.lookAtMatrix,translate(this.location[0],this.location[1],this.location[2])),
							rotateZ(this.theta[2])
						),							
						rotateY(this.theta[1])
					),
					rotateX(this.theta[0])
				),
				scalem(this.scale[0],this.scale[1],this.scale[2])
			);

    	this.normalMatrix = normalMatrix(this.modelViewMatrix,true);
			
		gl.uniformMatrix4fv(Shape.modelViewMatrixLoc,false,flatten(this.modelViewMatrix));
		gl.uniformMatrix4fv(Shape.projectionMatrixLoc,false,flatten(this.projectionMatrix));		
		gl.uniformMatrix3fv(Shape.normalMatrixLoc,false,flatten(this.normalMatrix));

		for (var i=0;i<lights.length;i++)
		{
			var ambientProduct=vec4(0,0,0,0),diffuseProduct=vec4(0,0,0,0),specularProduct=vec4(0,0,0,0);
			
			if (lights[i].lightOn)
			{
				ambientProduct = mult(lights[i].material.ambient, this.material.ambient);
				diffuseProduct = mult(lights[i].material.diffuse, this.material.diffuse);
				specularProduct = mult(lights[i].material.specular, this.material.specular);
			}
			

			gl.uniform4fv( gl.getUniformLocation(program,
		   		"lightSources["+i+"].ambientProduct"),flatten(ambientProduct) );
		
			gl.uniform4fv( gl.getUniformLocation(program,
		   		"lightSources["+i+"].diffuseProduct"),flatten(diffuseProduct) );
		
			gl.uniform4fv( gl.getUniformLocation(program,
		   		"lightSources["+i+"].specularProduct"),flatten(specularProduct) );

			var lightLocation = vec4(lights[i].location[0],lights[i].location[1],lights[i].location[2],1);
		
			gl.uniform4fv( gl.getUniformLocation(program,
		   		"lightSources["+i+"].lightPosition"),flatten(
		   			lightLocation
		   		) );	
		}

		//insert additional ambient light

		var ambientProduct = mult(vec4(0.2,0.2,0.2,1), this.material.ambient);
		var diffuseProduct = mult(vec4(0,0,0,0), this.material.diffuse);
		var specularProduct = mult(vec4(0,0,0), this.material.specular);

		gl.uniform4fv( gl.getUniformLocation(program,
	   		"lightSources["+lights.length+"].ambientProduct"),flatten(ambientProduct) );
	
		gl.uniform4fv( gl.getUniformLocation(program,
	   		"lightSources["+lights.length+"].diffuseProduct"),flatten(diffuseProduct) );
	
		gl.uniform4fv( gl.getUniformLocation(program,
	   		"lightSources["+lights.length+"].specularProduct"),flatten(specularProduct) );

		// light count

		gl.uniform1i( gl.getUniformLocation(program,
		   		"lightCount"),lights.length+1 );	

		gl.uniform1f( gl.getUniformLocation(program,
		   "shininess"),this.material.shininess );		
	}
}

Cone.prototype = new Shape();
Cone.prototype.constructor=Cone;

function Cone ()
{
	if (typeof Cone.vBuffer==='undefined' || Cone.vBuffer==null)
	{
		Cone.npoints = 25;
		
		console.log("creando geometria del cone");
		
		var vertices = [vec3(0,-1,0)];
		var normals = [vec3(0,-1,0)];
		
		//bottom
		
		var delta = 2*Math.PI/Cone.npoints;
		var i=0,ang=0;
		
		for (i=1,ang=0;i<=Cone.npoints;i++,ang+=delta)
		{
			vertices.push(vec3(Math.cos(ang),-1,Math.sin(ang)));
			normals.push(normals[0]);
		}
		
		vertices.push(vertices[1]);
		normals.push(normals[0]);
		
		// sides
		
		for (i=0,ang=0;i<Cone.npoints;i++,ang+=delta)
		{
			var a = vertices[i+1];
			var b = vec3(0,1,0);
			var c = vertices[(i+1)%Cone.npoints + 1];
			
			vertices.push(a);
			normals.push(vec3(a[0],0,a[2]));
			
			vertices.push(b);		
			normals.push(vec3(Math.cos(ang+delta/2.0),0,Math.sin(ang+delta/2.0)));
			
			vertices.push(c);
			normals.push(vec3(c[0],0,c[2]));
			
			// crossed normals
			
			/*var crossNormal = normalize(cross((subtract(b,a)),subtract(c,b)));
			
			normals.push(crossNormal);
			normals.push(crossNormal);
			normals.push(crossNormal);*/
		}

		// Load the data into the GPU

		Cone.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cone.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
		
		Cone.vNormalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cone.vNormalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
		
		Cone.vPosition = gl.getAttribLocation( program, "vPosition" );
		Cone.vNormal = gl.getAttribLocation( program, "vNormal" );
	}
	
	this.render = function ()
	{
		this.constructor.prototype.render.call(this);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, Cone.vBuffer );
		
		gl.vertexAttribPointer( Cone.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cone.vPosition );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, Cone.vNormalBuffer );

		gl.vertexAttribPointer( Cone.vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cone.vNormal );
	
		gl.uniform4fv(Shape.bottomColorLoc, this.objBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.objTopColor);
		
		gl.drawArrays( gl.TRIANGLE_FAN, 0, Cone.npoints+2 );
		gl.drawArrays( gl.TRIANGLES, Cone.npoints+2, Cone.npoints*3 );
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
		
		var normals = [vec3(0,-1,0)];
		
		var delta = 2*Math.PI/Cylinder.npoints;
		
		var i=0,ang=0;
		
		// bottom lid
		
		for (i=1,ang=0;i<=Cylinder.npoints;i++,ang+=delta)
		{
			vertices.push(vec3(Math.cos(ang),-1,Math.sin(ang)));
			indices.push(i);
			
			normals.push(vec3(0,-1,0));
		}
		
		indices.push(1);
		normals.push(vec3(0,-1,0));
		
		// top lid
		vertices.push(vec3(0,1,0));
		indices.push(vertices.length-1);
		
		normals.push(vec3(0,1,0));
		
		var first_top_index = indices.length;
		
		for (i=1,ang=0;i<=Cylinder.npoints;i++,ang+=delta)
		{
			vertices.push(vec3(Math.cos(ang),1,Math.sin(ang)));
			indices.push(vertices.length-1);
			
			normals.push(vec3(0,1,0));
		}
		
		indices.push(indices[first_top_index]);
		normals.push(vec3(0,1,0));
		
		// sides
		
		var bot,top;
		
		var normOffset = normals.length;
		
		for (bot=1,top=bot+Cylinder.npoints+1;bot<=Cylinder.npoints;top++,bot++)
		{
			indices.push(bot);
			var vert = vertices[indices[bot]];
			normals.push(vec3(vert[0],0,vert[2]));
			
			indices.push(top);
			normals.push(vec3(vert[0],0,vert[2]));
		}
		
		indices.push(1);
		indices.push(Cylinder.npoints+2);
		
	
		normals.push(normals[normOffset]);
		normals.push(normals[normOffset+1]);

		var realVerts = [];

		for (var i=0;i<indices.length;i++)
			realVerts.push(vertices[indices[i]]);
		
		
		// array element buffer

		/*Cylinder.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);*/

		// Load the data into the GPU

		Cylinder.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(realVerts), gl.STATIC_DRAW );

		// Normals

		Cylinder.vNormals = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.vNormals );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

		// Associate out shader variables with our data buffer

		Cylinder.vPosition = gl.getAttribLocation( program, "vPosition" );
		Cylinder.vNormal = gl.getAttribLocation( program, "vNormal" );
		
		/*
		// debugging normals
		
		var dnormals = [];
		
		for (var i=0;i<indices.length;i++)
		{
			dnormals.push(vertices[indices[i]]);
			dnormals.push(add(vertices[indices[i]],scale(2,normals[i])));
		}
		
		Cylinder.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(dnormals), gl.STATIC_DRAW );
		
		Cylinder.normalCount = indices.length*2;*/
	}
	
	this.render = function () 
	{
		this.constructor.prototype.render.call(this);
		
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder.iBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.vBuffer );
		
		gl.vertexAttribPointer( Cylinder.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cylinder.vPosition );

		/*gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cylinder.iNormals );*/
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.vNormals );

		gl.vertexAttribPointer( Cylinder.vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cylinder.vNormal );
		
		gl.drawArrays( gl.TRIANGLE_FAN, 0, Cylinder.npoints+2);
		gl.drawArrays( gl.TRIANGLE_FAN, (Cylinder.npoints+2), Cylinder.npoints+2);
		
		gl.drawArrays( gl.TRIANGLE_STRIP, (Cylinder.npoints+2)*2, Cylinder.npoints*2+2);
		
		/*gl.uniform4fv(Shape.bottomColorLoc, this.linesBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.linesTopColor);
		
		gl.drawElements( gl.LINE_STRIP, Cylinder.npoints+2, gl.UNSIGNED_SHORT, 2 );
		gl.drawElements( gl.LINE_STRIP, Cylinder.npoints+2, gl.UNSIGNED_SHORT, 2 + (Cylinder.npoints+2)*2 );
		gl.drawElements( gl.LINES, Cylinder.npoints*2+2, gl.UNSIGNED_SHORT, (Cylinder.npoints+2)*4 );*/
		
		
		/*
		// Debug normals
		
		gl.bindBuffer( gl.ARRAY_BUFFER, Cylinder.normalBuffer );
		
		gl.vertexAttribPointer( Cylinder.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cylinder.vPosition );
		
		gl.vertexAttribPointer( Cylinder.vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Cylinder.vNormal );
		
		gl.drawArrays(gl.LINES,0,Cylinder.normalCount);
		*/
	}
}

Sphere.prototype = new Shape();
Sphere.prototype.constructor=Sphere;

function Sphere ()
{
	if (typeof Sphere.vBuffer==='undefined' || Sphere.vBuffer==null)
	{	
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
		Sphere.vNormal = gl.getAttribLocation( program, "vNormal" );
		
		
		// debugging normals
		
		var normals = [];
		
		for (var i=0;i<indices.length;i++)
		{
			normals.push(vertices[indices[i]]);
			normals.push(scale(2,vertices[indices[i]]));
		}
		
		Sphere.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
		
		Sphere.normalCount = indices.length*2;
	}
	
	this.render = function ()
	{
		this.constructor.prototype.render.call(this);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.iBuffer);
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.vBuffer );
		
		gl.vertexAttribPointer( Sphere.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vPosition );
		
		gl.vertexAttribPointer( Sphere.vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vNormal );
		
		//gl.uniform4fv(Shape.bottomColorLoc, this.objBottomColor);
		//gl.uniform4fv(Shape.topColorLoc, this.objTopColor);		

		   
		/*console.log(this.lookAtMatrix[0]);
		console.log(this.lookAtMatrix[1]);
		console.log(this.lookAtMatrix[2]);
		console.log(this.lookAtMatrix[3]);
		
		var vertices = [vec3(0,1,0),vec3(-1,-1,0),vec3(1,-1,0)];
		var vBuffer = gl.createBuffer();		
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
		
		gl.vertexAttribPointer( Sphere.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vPosition );
		
		var normals = [vec3(0,0,-1),vec3(0,0,-1),vec3(0,0,-1)];
		var vNormals = gl.createBuffer();		
		gl.bindBuffer( gl.ARRAY_BUFFER, vNormals );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
		
		gl.vertexAttribPointer( Sphere.vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vNormal );
		
		gl.drawArrays(gl.TRIANGLES,0,3);*/
		
		var i;
	
		for (i=0;i<Sphere.npoints-1;i++)
			gl.drawElements( gl.TRIANGLE_STRIP, Sphere.npoints*2+2, gl.UNSIGNED_SHORT, (Sphere.npoints*Sphere.npoints + i*(Sphere.npoints*2+2))*2);
		
		var poleOffset = (Sphere.npoints*Sphere.npoints + (Sphere.npoints-1)*(Sphere.npoints*2+2));
		gl.drawElements( gl.TRIANGLE_FAN, Sphere.npoints+2, gl.UNSIGNED_SHORT, poleOffset*2);
		gl.drawElements( gl.TRIANGLE_FAN, Sphere.npoints+2, gl.UNSIGNED_SHORT, (poleOffset+Sphere.npoints+2)*2);
			
		gl.uniform4fv(Shape.bottomColorLoc, this.linesBottomColor);
		gl.uniform4fv(Shape.topColorLoc, this.linesTopColor);
		
		/*for (i=0;i<Sphere.npoints;i++)
			gl.drawElements( gl.LINE_LOOP, Sphere.npoints, gl.UNSIGNED_SHORT, i*Sphere.npoints*2);
			
		for (i=0;i<Sphere.npoints;i++)
		{
			var offset = (poleOffset+(Sphere.npoints+2)*2+i*Sphere.npoints)*2;
			gl.drawElements( gl.LINE_STRIP, Sphere.npoints, gl.UNSIGNED_SHORT, offset);
		}*/

		// Debug normals
		
		/*gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.normalBuffer );
		
		gl.vertexAttribPointer( Sphere.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vPosition );
		
		gl.vertexAttribPointer( Sphere.vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Sphere.vNormal );
		
		gl.drawArrays(gl.LINES,0,Sphere.normalCount);*/
	}
}

Light.prototype = new Shape();
Light.prototype.constructor=Light;

function Light ()
{
	this.material = 
	{
		ambient : vec4(0.2, 0.2, 0.2, 1.0 ),
		diffuse : vec4( 1.0, 1.0, 1.0, 1.0 ),
		specular : vec4( 1.0, 1.0, 1.0, 1.0 ),
		shininess : 0
	};

	this.animationTheta = 0;
	this.animated = false;
	this.lightOn = true;

	if (typeof Light.vBuffer==='undefined' || Light.vBuffer==null)
	{
		var vertices = [
			vec3(-1,0,0),vec3(1,0,0),
			vec3(0,1,0),vec3(0,-1,0),
			vec3(0,0,-1),vec3(0,0,1),
			normalize(vec3(-1,1,-1)),normalize(vec3(1,-1,1)),
			normalize(vec3(1,1,-1)),normalize(vec3(-1,-1,1)),
			normalize(vec3(1,1,1)),normalize(vec3(-1,-1,-1)),
			normalize(vec3(-1,1,1)),normalize(vec3(1,-1,-1)),
			];
		
		// Load the data into the GPU

		Light.vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Light.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

		// Associate out shader variables with our data buffer

		Light.vPosition = gl.getAttribLocation( program, "vPosition" );
	}
	
	this.render = function ()
	{
		this.constructor.prototype.render.call(this);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, Light.vBuffer );
		
		gl.vertexAttribPointer( Light.vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( Light.vPosition );
		
		gl.uniform4fv(Shape.bottomColorLoc, vec4(1,1,1,1));
		gl.uniform4fv(Shape.topColorLoc, vec4(1,1,1,1));
		
		gl.drawArrays(gl.LINES,0,14);
	}
}

var gl;
var program;

var selectedShape = null;
var shapes = [];
var lights = [];

var coneCount = 0;
var cylinderCount = 0;
var sphereCount = 0;
var lightCount = 0;

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
	
	var opt = new Option(newShape.name,shapes.length-1);
	opt.selected = "selected";
	document.getElementById("objListBox").add(opt);
}

function setSliderValues (shape)
{
	document.getElementById("RotXSlider").value = shape.theta[0];
	document.getElementById("RotYSlider").value = shape.theta[1];
	document.getElementById("RotZSlider").value = shape.theta[2];

	document.getElementById("TransXSlider").value = shape.location[0];
	document.getElementById("TransYSlider").value = shape.location[1];
	document.getElementById("TransZSlider").value = shape.location[2];

	document.getElementById("ScaleXSlider").value = shape.scale[0];
	document.getElementById("ScaleYSlider").value = shape.scale[1];
	document.getElementById("ScaleZSlider").value = shape.scale[2];

	document.getElementById("MaterialAmbientRInput").value = Math.round(shape.material.ambient[0]*255);
	document.getElementById("MaterialAmbientGInput").value = Math.round(shape.material.ambient[1]*255);
	document.getElementById("MaterialAmbientBInput").value = Math.round(shape.material.ambient[2]*255);

	document.getElementById("MaterialDiffuseRInput").value = Math.round(shape.material.diffuse[0]*255);
	document.getElementById("MaterialDiffuseGInput").value = Math.round(shape.material.diffuse[1]*255);
	document.getElementById("MaterialDiffuseBInput").value = Math.round(shape.material.diffuse[2]*255);

	document.getElementById("MaterialSpecularRInput").value = Math.round(shape.material.specular[0]*255);
	document.getElementById("MaterialSpecularGInput").value = Math.round(shape.material.specular[1]*255);
	document.getElementById("MaterialSpecularBInput").value = Math.round(shape.material.specular[2]*255);

	document.getElementById("MaterialShininessInput").value = shape.material.shininess;
	
	if (shape.name.indexOf("Light")==0)
	{
		document.getElementById("LightSwitchCheckbox").checked = selectedShape.lightOn;
		document.getElementById("AnimateCheckbox").checked = selectedShape.animated;
		
		document.getElementById("TransformDiv").style.display = 'block';
		document.getElementById("RotationDiv").style.display = 'none';
		document.getElementById("ScaleDiv").style.display = 'none';
		document.getElementById("LightingDescription").innerHTML = "Light Parameters";
		document.getElementById("ShininessDiv").style.display = 'none';
		document.getElementById("AnimateDiv").style.display = 'block';		
		document.getElementById("LightSwitchDiv").style.display = 'block';
	}
	else
	{
		document.getElementById("TransformDiv").style.display = 'block';
		document.getElementById("RotationDiv").style.display = 'block';
		document.getElementById("ScaleDiv").style.display = 'block';
		document.getElementById("LightingDescription").innerHTML = "Material Parameters";
		document.getElementById("ShininessDiv").style.display = 'block';
		document.getElementById("AnimateDiv").style.display = 'none';
		document.getElementById("LightSwitchDiv").style.display = 'none';
	}
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );	
	
	Shape.modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	Shape.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	Shape.normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
	
	document.getElementById("ConeButton").onclick = function(event)
	{
		var newCone = new Cone();
		newCone.name = "Cone"+(++coneCount);
		initShape(newCone,vec4(1,0,0,1),vec4(0,0,0,1));

		//render();
	}

	document.getElementById("CylinderButton").onclick = function(event)
	{
		var newCylinder = new Cylinder();
		newCylinder.name = "Cylinder"+(++cylinderCount);
		initShape(newCylinder,vec4(0,1,0,1),vec4(0,0,0,1));

		//render();
	}

	document.getElementById("SphereButton").onclick = function(event)
	{
		var newSphere = new Sphere();
		newSphere.name = "Sphere"+(++sphereCount);
		initShape(newSphere,vec4(0,0,1,1),vec4(0,0,1,1));

		//render();
	}
	
	document.getElementById("LightButton").onclick = function(event)
	{
		if (lightCount==10)
			return;

		var newLight = new Light();
		newLight.name = "Light"+(++lightCount);
		initShape(newLight,vec4(1,1,1,1),vec4(1,1,1,1));
		newLight.scale = vec3(0.1,0.1,0.1);

		lights.push(newLight);

		//render();
	}

	document.getElementById("RotXSlider").onmousemove = function(event)
	{
		selectedShape.theta = 
			vec3(
				event.target.value,
				selectedShape.theta[1],
				selectedShape.theta[2]
				);

		//render();
	}

	document.getElementById("RotYSlider").onmousemove = function(event)
	{
		selectedShape.theta = 
			vec3(
				selectedShape.theta[0],
				event.target.value,				
				selectedShape.theta[2]
				);

		//render();
	}

	document.getElementById("RotZSlider").onmousemove = function(event)
	{
		selectedShape.theta = 
			vec3(
				selectedShape.theta[0],
				selectedShape.theta[1],
				event.target.value				
				);

		//render();
	}

	document.getElementById("TransXSlider").onmousemove = function(event)
	{
		selectedShape.location = 
			vec3(
				event.target.value,
				selectedShape.location[1],
				selectedShape.location[2]
				);

		//render();
	}

	document.getElementById("TransYSlider").onmousemove = function(event)
	{
		selectedShape.location = 
			vec3(
				selectedShape.location[0],
				event.target.value,
				selectedShape.location[2]
				);

		//render();
	}

	document.getElementById("TransZSlider").onmousemove = function(event)
	{
		selectedShape.location = 
			vec3(
				selectedShape.location[0],
				selectedShape.location[1],
				-event.target.value
				);

		//render();
	}

	document.getElementById("ScaleXSlider").onmousemove = function(event)
	{
		selectedShape.scale =
			vec3(
				event.target.value,
				selectedShape.scale[1],
				selectedShape.scale[2]
				);

		//render();
	}

	document.getElementById("ScaleYSlider").onmousemove = function(event)
	{
		selectedShape.scale =
			vec3(
				selectedShape.scale[0],
				event.target.value,
				selectedShape.scale[2]
				);

		//render();
	}

	document.getElementById("ScaleZSlider").onmousemove = function(event)
	{
		selectedShape.scale =
			vec3(				
				selectedShape.scale[0],
				selectedShape.scale[1],
				event.target.value
				);

		//render();
	}

	document.getElementById("MaterialAmbientRInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : vec4(
					event.target.value/255.0,
					selectedShape.material.ambient[1],
					selectedShape.material.ambient[2],
					1
				),
			diffuse : selectedShape.material.diffuse,
			specular : selectedShape.material.specular,			
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialAmbientGInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : vec4(
					selectedShape.material.ambient[0],
					event.target.value/255.0,
					selectedShape.material.ambient[2],
					1
				),
			diffuse : selectedShape.material.diffuse,
			specular : selectedShape.material.specular,			
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialAmbientBInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : vec4(
					selectedShape.material.ambient[0],				
					selectedShape.material.ambient[1],
					event.target.value/255.0,
					1
				),
			diffuse : selectedShape.material.diffuse,
			specular : selectedShape.material.specular,
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialDiffuseRInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			diffuse : vec4(
					event.target.value/255.0,
					selectedShape.material.diffuse[1],				
					selectedShape.material.diffuse[2],					
					1
				),			
			specular : selectedShape.material.specular,
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialDiffuseGInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			diffuse : vec4(					
					selectedShape.material.diffuse[0],				
					event.target.value/255.0,
					selectedShape.material.diffuse[2],					
					1
				),			
			specular : selectedShape.material.specular,
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialDiffuseBInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			diffuse : vec4(					
					selectedShape.material.diffuse[0],									
					selectedShape.material.diffuse[1],					
					event.target.value/255.0,
					1
				),			
			specular : selectedShape.material.specular,
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialSpecularRInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			diffuse : selectedShape.material.diffuse,	
			specular : vec4(
					event.target.value/255.0,
					selectedShape.material.specular[1],				
					selectedShape.material.specular[2],					
					1
				),		
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialSpecularGInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			diffuse : selectedShape.material.diffuse,	
			specular : vec4(
					selectedShape.material.specular[0],				
					event.target.value/255.0,					
					selectedShape.material.specular[2],					
					1
				),		
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialSpecularBInput").onchange = function(event)
	{
		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			diffuse : selectedShape.material.diffuse,	
			specular : vec4(
					selectedShape.material.specular[0],									
					selectedShape.material.specular[1],
					event.target.value/255.0,										
					1
				),		
			shininess : selectedShape.material.shininess
		}

		//render();
	}

	document.getElementById("MaterialShininessInput").onchange = function(event)
	{
		//selectedShape.material.shininess = event.target.value;

		selectedShape.material = 
		{
			ambient : selectedShape.material.ambient,
			specular : selectedShape.material.specular,
			diffuse : selectedShape.material.diffuse,
			shininess : event.target.value
		}
		//render();
	}

	document.getElementById("AnimateCheckbox").onchange = function(event)
	{
		selectedShape.animated = event.target.checked;

		if (!event.target.checked)
			selectedShape.animationTheta = 0.0;
		else
			selectedShape.animationTheta = 0.2;
			
	}
	
	document.getElementById("LightSwitchCheckbox").onchange = function(event)
	{
		selectedShape.lightOn = event.target.checked;
	}
	
	document.getElementById("objListBox").onchange = function ()
	{
		console.log(event.target.value);
		selectedShape = shapes[event.target.value];
		setSliderValues(selectedShape);
	}
	
    render();
};


function render() {
	//console.log("rendering "+shapes.length+" shapes");
    gl.clear( gl.COLOR_BUFFER_BIT ); 

    for (var i=0;i<lights.length;i++)
    {
    	if (lights[i].animated)
    	{
	    	var transform = mult(rotateZ(lights[i].animationTheta),rotateY(lights[i].animationTheta));
	    	transform = mult(transform,rotateX(lights[i].animationTheta));

	    	var oldLocation = vec4(lights[i].location[0],lights[i].location[1],lights[i].location[2],1);

	    	var newLocation = vec3(
	    			dot(transform[0],oldLocation),
	    			dot(transform[1],oldLocation),
	    			dot(transform[2],oldLocation)
	    		);

	    	lights[i].location = newLocation;
			
			if (lights[i] == selectedShape)
				setSliderValues(selectedShape);
	    }
    }

    for (var i=0;i<shapes.length;i++)
    {
    	//console.log("rendering "+shapes[i].name);
    	shapes[i].render();
    }

    requestAnimFrame(render);
}
