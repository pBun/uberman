// set up options
var options = {
    $wrapper: $('.uber-wrapper'),
    $uberman: $('.uberman'),
    moveSpeedMultiplier: 6.25,
    moveSpeed: '',
    moveEasing: 'linear',
    rightBoundry: '',
    bottomBoundry: '',
    groundHeight: 30,
    controlLock: false,
    uberman: {
        direction: 'right',
        animations: {
            'warp': false,
            'run': false,
            'jump': false,
            'blaster': false,
            'idle': false
        }
    }
};

// set up functions

function setSpeeds(){
    options.moveSpeed = options.$wrapper.width() * options.moveSpeedMultiplier;
    options.rightBoundry = options.$wrapper.width() - options.$uberman.width();
    options.bottomBoundry = options.$wrapper.height() - options.$uberman.height();
}

function setDirection(direction){
    options.uberman.direction = direction;
    options.$uberman.removeClass('left right').addClass(direction);
}

function getAnimations(){
    return $.map(options.uberman.animations, function(status, animation){
        if (status){
            return animation;
        }
    });
}

function getDistanceRan(){
    var xposition = options.$uberman.position().left;
    return xposition / options.rightBoundry;
}
function getRunSpeed(){
    var distFrac = getDistanceRan();
    if (options.uberman.direction === 'left'){
        distFrac = 1 - distFrac;
    }
    var speedOffset = distFrac * options.moveSpeed;
    return options.moveSpeed - speedOffset;
}
function faceRight(){
    if(options.uberman.direction != 'right'){
        setDirection('right');
    }
}
function faceLeft(){
    if(options.uberman.direction != 'left'){
        setDirection('left');
    }
}
function runRight(){
    if(options.uberman.direction === 'left' && options.uberman.animations['run']){
        stopRun();
    }
    if(options.uberman.direction !== 'right'){
        faceRight();
    }
    if(!options.uberman.animations['run']){
        startRun();
        options.$uberman.stop().animate({left: options.rightBoundry}, getRunSpeed(), options.moveEasing, stopRun);
    }        
}
function runLeft(){
    if(options.uberman.direction === 'right' && options.uberman.animations['run']){
        stopRun();
    }
    if(options.uberman.direction !== 'left'){
        faceLeft();
    }
    if(!options.uberman.animations['run']){
        startRun();
        options.$uberman.stop().animate({left: 0}, getRunSpeed(), options.moveEasing, stopRun);
    }
}
function startRun(){
    if(!options.uberman.animations['run']){
        stopIdle();
        options.$uberman.addClass('run');
        options.uberman.animations.run = true;
    }
}
function stopRunRight(){
    if(options.uberman.direction != 'right'){
        return;
    }
    stopRun();
}
function stopRunLeft(){
    if(options.uberman.direction != 'left'){
        return;
    }
    stopRun();
}
function stopRun(){
    options.$uberman.stop().removeClass('run');
    options.uberman.animations.run = false;
}

function blaster(){
    if(options.uberman.animations['blaster']){
        return;
    }
    stopIdle();
    options.uberman.animations.blaster = true;
    options.$uberman.addClass('blaster');
    
    // TODO: need a better way to handle auto-shooting
    setTimeout(function(){
        shoot();
        clearInterval(options.uberman.keepShooting);
        options.uberman.keepShooting = setInterval(function(){
            if (!options.uberman.animations['blaster']){
                return;
            }
            shoot();
        }, 500);
    }, 200);
}

function stopBlaster(){
    clearInterval(options.uberman.keepShooting);
    options.uberman.animations.blaster = false;
    options.$uberman.removeClass('blaster');
}
function shoot(){
    var $man = options.$uberman;
    var manPos = $man.position();
    var bullet = $('<div></div>').addClass('bullet').addClass(options.uberman.direction);
    options.$wrapper.append(bullet);
    bullet.css({left: manPos.left, top: manPos.top});
    var bulletDestination = options.uberman.direction === 'right' ? options.rightBoundry : 0;
    bullet.animate({left: bulletDestination}, getRunSpeed() / 2, options.moveEasing, function(){
        bullet.remove();
    });
}
function idle(){
    if (!isIdle()){
        return;
    }
    options.uberman.animations.idle = true;
    options.$uberman.addClass('idle');
    setTimeout(function(){
        stopIdle();
    }, 2000);
}

function stopIdle(){
    options.uberman.animations.idle = false;
    options.$uberman.removeClass('idle');
}

function warp(){
    options.controlLock = true;
    options.uberman.animations.warp = true;
    options.$uberman.addClass('warp').animate({top: options.bottomBoundry - options.groundHeight}, 1000);
    setTimeout(function(){
        options.uberman.animations.warp = false;
        options.$uberman.removeClass('warp');
        options.controlLock = false;
    }, 1000);
}

function isIdle() {
  var activeAnims = $.map(options.uberman.animations, function(active, name){
    if (active) {
      return name;
    }
  });
  return activeAnims.length > 0;
}

function stopAll(){
  stopIdle();
  stopRun();
  stopBlaster();
}

function reset() {
  $('.controls a').removeClass('active');
  stopAll();
  setSpeeds();
  options.$uberman.css({left: 0, top: 0});
  warp();
}

// main

// setup
options.$uberman.addClass(options.uberman.direction);
setSpeeds();
warp();

// idle every 10 seconds
setInterval(function(){
    idle();
}, 10000);

// adjust for resize
$(window).on('resize', function(e){
    setSpeeds();
    options.$uberman.css({left: 0});
});

$(document).on('keydown', function(e) {

    e.preventDefault();
  
    // do nothing if control locked
    if (options.controlLock){
        return;
    }

    // stop idling when key pressed
    stopIdle();

    // d' '>' keydown change direction right
    if (e.keyCode === 39 || e.keyCode === 68) {
        runRight();
    }

    // 'a' '<' keydown change direction left
    if (e.keyCode === 37 || e.keyCode === 65) {
        runLeft();
    }

    // space keydown
    if (e.keyCode === 32) {
        blaster();
    }
});

$(document).on('keyup', function(e) {
    
    // do nothing if control locked
    if (options.controlLock){
        return;
    }
    
    // d' '>' key up
    if (e.keyCode === 39 || e.keyCode === 68) {
        stopRunRight();
    }

    // 'a' '<' key up
    if (e.keyCode === 37 || e.keyCode === 65) {
        stopRunLeft();
    }

    // space keyup
    if (e.keyCode === 32) {
        stopBlaster();
    }

});

$(document).on('click', function(e) {
  
  e.preventDefault(); 
  
  // if 'left' clicked
  if ($(e.target).is('.left')) {
    if ($(e.target).is('.active')){
      stopRun();
      $(e.target).removeClass('active')
      return;
    }
    runLeft();
    $('.right').removeClass('active');
    $(e.target).addClass('active');
  }
  
  // if 'right' clicked
  if ($(e.target).is('.right')) {
    if ($(e.target).is('.active')){
      stopRun();
      $(e.target).removeClass('active')
      return;
    }
    runRight();
    $('.left').removeClass('active');
    $(e.target).addClass('active');
  }
  
  // if 'left' clicked
  if ($(e.target).is('.shoot')) {
    if (!options.uberman.animations.blaster) {
      blaster();
    } else {
      stopBlaster();
    }
  }
  
  // if 'left' clicked
  if ($(e.target).is('.reset')) {
    reset();
  }
  
});

// stop animations when user alt tabs or clicks off window
$(window).on('blur', function(e) {
    stopRun();
    stopBlaster();
});
