window.onload = init;

var map;
var ctxMap;

var pl;
var ctxPl;

var enemyCvs;
var ctxEnemy;

var stats;
var ctxStats;

var closebtn;


//var drawBtn;
//var clearBtn;

var gameWidth = 800;
var gameHeight = 500;

var background = new Image();
background.src = "img/World2.png";

var background1 = new Image();
background1.src = "img/World2.png";

var tiles = new Image();
tiles.src = "img/title.png";

var player;
var enemies = [];

var isPlaying;
var health;

var mapX = 0;
var map1X = gameWidth;

var spawnInterval;
var spawnTime = 6000;
var spawnAmount = 3;

var mouseX;
var mouseY;

var requestAnimFrame = window.requestAnimationFrame ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						window.msRequestAnimationFrame;

function init(){
	map = document.getElementById("map");
	ctxMap = map.getContext("2d");

	pl = document.getElementById("player");
	ctxPl = pl.getContext("2d");

	enemyCvs = document.getElementById("enemy");
	ctxEnemy = enemyCvs.getContext("2d");

	stats = document.getElementById("stats");
	ctxStats = stats.getContext("2d");

	closebtn = document.getElementById("close-game");

	map.width = gameWidth;
	map.height = gameHeight;
	pl.width = gameWidth;
	pl.height = gameHeight;
	enemyCvs.width = gameWidth;
	enemyCvs.height = gameHeight;
	stats.width = gameWidth;
	stats.height = gameHeight;

	var gradient=ctxStats.createLinearGradient(0,0,gameWidth,0);
	gradient.addColorStop("0","magenta");
	gradient.addColorStop("0.5","blue");
	gradient.addColorStop("1.0","red");
	// Fill with gradient
	ctxStats.fillStyle=gradient;

	//ctxStats.fillStyle = "#3D3D3D";
	ctxStats.font = "bold 15pt Arial";

	//drawBtn = document.getElementById("drawBtn");
	//clearBtn = document.getElementById("clearBtn");

	//drawBtn.addEventListener("click", drawRect, false);
	//clearBtn.addEventListener("click", clearRect, false);

	player = new Player();

	resetHealth();
	
	startLoop();
	
	document.addEventListener("mousemove", mouseMove, false);
	document.addEventListener("click", mouseClick, false);
	document.addEventListener("keydown", checkKeyDown, false);
	document.addEventListener("keyup", checkKeyUp, false);
}

function mouseMove(e){
	mouseX = e.pageX;
	mouseY = e.pageY;

	document.getElementById("gameName").innerHTML = "X: "+mouseX+" Y: "+mouseY;
}

function mouseClick(e) {
	
}

function gameOver(){
	ctxStats.fillText("Game over", gameWidth/2 - 50, gameHeight/2);
	setTimeout(function() {closebtn.click() }, 2000);
	stopLoop();
}

function resetHealth(){
	health = 100;
}

function spawnEnemy(count){
	for(var i=0; i<count; i++){
		enemies[i] = new Enemy();
		if (Math.random() > 0.9) {
			enemies[i].srcY = 240;

			enemies[i].interactWithPlayer = function(player){
				health ++;
			}
		}
	}
}

function startCreatingEnemies(){
	stopCreatingEnemies();
	spawnInterval = setInterval(function(){spawnEnemy(spawnAmount)}, spawnTime);
}

function stopCreatingEnemies(){
	clearInterval(spawnInterval);
}

function loop(){
	if(isPlaying){
		draw();
		update();
		requestAnimFrame(loop);
	}
}

function startLoop(){
	isPlaying = true;
	loop();
	startCreatingEnemies();
}


function stopLoop(){
	isPlaying = false;
}

function draw(){
	player.draw();
	clearCtxEnemy();
	for(var i = 0; i < enemies.length; i++){
		enemies[i].draw();
	}
}

function update(){
	moveBg();
	drawBg();
	updateStats();
	player.update();
	for(var i = 0; i < enemies.length; i++){
		enemies[i].update();
	}
}

function moveBg(){
	var vel = 4;
	mapX -= 4;
	map1X -= 4;
	if(mapX+gameWidth<0) mapX = gameWidth-5;
	if(map1X+gameWidth<0) map1X = gameWidth-5;
}

function Player (){
	this.srcX = 0;
	this.srcY = 0;
	this.drawX = 0;
	this.drawY = 0;
	this.width = 150;
	this.height = 109;
	this.speed = 3;

	this.isUp = false;
	this.isDown = false;
	this.isRight = false;
	this.isLeft = false;
	this.speed = 5;
}

function Enemy (){
	this.srcX = 0;
	this.srcY = 120;
	this.drawX = Math.floor(Math.random() * gameWidth) + gameWidth;
	this.drawY = Math.floor(Math.random() * gameHeight);
	this.width = 127;
	this.height = 99;

	this.speed = 8;
}

Enemy.prototype.draw = function(){
	
	ctxEnemy.drawImage(tiles, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}

Enemy.prototype.update = function(){
	this.drawX -= 7;
	if(this.drawX + this.width < 0){
		this.destroy();
	}
}

Enemy.prototype.interactWithPlayer = function(player){
	health --;
}

Enemy.prototype.destroy = function(){
	enemies.splice(enemies.indexOf(this),1);
}

Player.prototype.draw = function(){
	clearCtxPlayer();
	ctxPl.drawImage(tiles, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}

function isAABBsCollided (a, b){
	/*
	if (a.drawX >= b.drawX && a.drawX <= b.drawX + b.width &&
		a.drawY >= b.drawY && a.drawY <= b.drawY + b.height)
		return true;
	*/
	if (Math.max(a.drawX, b.drawX) <= Math.min(a.drawX + a.width, b.drawX + b.width) && 
		Math.max(a.drawY, b.drawY) <= Math.min(a.drawY + a.height, b.drawY + b.height))
			return true;

	return false;
}

Player.prototype.update = function(){
	if(health < 0) gameOver();

	if(this.drawX < 0)this.drawX = 0;
	if(this.drawX > gameWidth - this.width)this.drawX = gameWidth - this.width;
	if(this.drawY < 0)this.drawY = 0;
	if(this.drawY > gameHeight - this.height)this.drawY = gameHeight - this.height;

	for(var i = 0; i < enemies.length; i++){
		var currentObj = enemies[i];
		if (isAABBsCollided(this, currentObj)) {
			currentObj.interactWithPlayer(this);
		}
	}

	this.chooseDir();
}


Player.prototype.chooseDir = function(){
	if(this.isUp)
		this.drawY -= this.speed;
	if(this.isDown)
		this.drawY += this.speed;
	if(this.isRight)
		this.drawX += this.speed;
	if(this.isLeft)
		this.drawX -= this.speed;
}

function checkKeyDown(e){
	var keyID = e.keyCode || e.which;
	var keyChar = String.fromCharCode(keyID);

	if(keyChar == "W"){
		player.isUp = true;
		e.preventDefault();
	}
	if(keyChar == "S"){
		player.isDown = true;
		e.preventDefault();
	}
	if(keyChar == "D"){
		player.isRight = true;
		e.preventDefault();
	}
	if(keyChar == "A"){
		player.isLeft = true;
		e.preventDefault();
	}
}

function checkKeyUp(e){
	var keyID = e.keyCode || e.which;
	var keyChar = String.fromCharCode(keyID);

	if(keyChar == "W"){
		player.isUp = false;
		e.preventDefault();
	}
	if(keyChar == "S"){
		player.isDown = false;
		e.preventDefault();
	}
	if(keyChar == "D"){
		player.isRight = false;
		e.preventDefault();
	}
	if(keyChar == "A"){
		player.isLeft = false;
		e.preventDefault();
	}
}

function drawRect(){
	ctxMap.fillStyle = "#3D3D3D";
	ctxMap.fillRect(10, 10, 100, 100);
}

function clearRect() {
	ctxMap.clearRect(0, 0, 800, 500);
}

function clearCtxPlayer(){
	ctxPl.clearRect(0, 0, gameWidth, gameHeight);
}

function clearCtxEnemy(){
	ctxEnemy.clearRect(0, 0, gameWidth, gameHeight);
}

function updateStats(){
	ctxStats.clearRect(0, 0, gameWidth, gameHeight);
	ctxStats.fillText("Health: " + health, 10, 20);
}

function drawBg(){
	ctxMap.clearRect(0, 0, gameWidth, gameHeight);
	ctxMap.drawImage(background, 0, 0, 801, 515, mapX, 0, gameWidth, gameHeight);
	ctxMap.drawImage(background1, 0, 0, 801, 515, map1X, 0, gameWidth, gameHeight);
}

