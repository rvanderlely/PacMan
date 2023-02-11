/*----------------------------------------------------------------------------
              Canvas Setup
-----------------------------------------------------------------------------*/
const canvas = document.getElementById('canvas'); //Create a canvas and give it a 2D context 
const ctx = canvas.getContext('2d');
const scoreE = document.getElementById('scoreE'); //Create a canvas and give it a 2D context 
canvas.width = 445
canvas.height = 525

/*----------------------------------------------------------------------------
              startGame Function
-----------------------------------------------------------------------------*/
function startGame()
{
toggleScreen('canvas',true)
toggleScreen('scoreboard',true)
toggleScreen('start-screen',false)

}
/*----------------------------------------------------------------------------
              endGame Function
----------------------------------------------------------------------------*/
function endGame()
{
  toggleScreen('gameOver',true)
}

/*----------------------------------------------------------------------------
              toggleScreen Function
-----------------------------------------------------------------------------*/
function toggleScreen(id,toggle)
{
let element = document.getElementById(id);
let display = (toggle) ? 'block' : 'none'
element.style.display = display;
}

/*******************************************************************
                      Pacman Class
********************************************************************/
class Pacman                                     
{
    constructor({position,velocity}) {
      this.position = position
      this.velocity = velocity 
      this.radians = .75
      this.chompRate = .12
      this.startingAngle = Math.PI*2 ; 
      this.closingAngle = 0 ;
      this.radius = 15
      this.rotation = 0 
    }

    drawPacman(){
      ctx.beginPath();                            
      ctx.arc(this.position.x,this.position.y,this.radius,(this.startingAngle - this.radians) ,(this.closingAngle + this.radians ),true);
      ctx.lineTo(this.position.x,this.position.y);
      ctx.lineWidth=8;
      ctx.stroke();
      ctx.fillStyle='yellow';
      ctx.fill();
    }
    /*-------------------------------------------------------------------------
                  updatepacman Method    
    Update Pacman Position, direction and chomp feature 
    Rotate direction of pacmans mouth depending on velococity(direction)
    Using translate function. Only rotate pacman, then retranslate back. 
    --------------------------------------------------------------------------*/
    updatePacmanPosition()
    {
      ctx.save()                                          //Save current canvas before applying the rotate effect
      ctx.translate(this.position.x,this.position.y)      //translate center of canvas temporarily to pacmans x y coordinates so we can rotate from his center
      ctx.rotate(this.rotation)                           //Rotate the canvas based on pacmans rotate attribute
      ctx.translate(-this.position.x,-this.position.y)    //Set center of canvas back to center of canvas
      this.drawPacman();                                  //Draw pacman
      this.position.x += this.velocity.x;                 //Update velocity x
      this.position.y += this.velocity.y;                 //Update velocity y

      //Pacman Chomp Feature 
      if(this.radians < 0 || this.radians > .75)
      {
       this.chompRate = -this.chompRate
      }
      this.radians += this.chompRate
      ctx.restore()                                       //Restore the canvase
    }  
    /*-----------------------------------------------------------------------------
                  rotate Pacman Method
    Update pacman rotation attribute  based on velocity (direction) he is moving 
    ------------------------------------------------------------------------------*/
    rotatePacman(){
      if(this.velocity.x > 0 ) this.rotation = 0
      else if(this.velocity.x < 0) this.rotation = Math.PI   
      else if(this.velocity.y > 0) this.rotation = Math.PI/2  
      else if(this.velocity.y < 0) this.rotation = Math.PI * 1.5 
    }
};

/*******************************************************
                      Pellets Class
Constructor takes in a position object. Position object 
contains x and y values where pellet will be drawn. 
********************************************************/
class Pellets                                     
{
      constructor({position}) {
      this.position = position
      this.startingAngle = Math.PI*2; 
      this.closingAngle = 0;
      this.radius = 3
    }
    drawPellet(){
      ctx.beginPath();                           
      ctx.arc(this.position.x,this.position.y,this.radius,this.startingAngle,this.closingAngle);
      ctx.fillStyle='white';
      ctx.fill();
    }
};

/*******************************************************
                      Power up Class
Constructor takes in a position object. Position object 
contains x and y values where PowerUp will be drawn. 
********************************************************/
class PowerUp                                      
{
      constructor({position}) {
      this.position = position
      this.startingAngle = Math.PI*2; 
      this.closingAngle = 0;
      this.radius = 10
    }
    drawPowerUp(){
      ctx.beginPath();                             
      ctx.arc(this.position.x,this.position.y,this.radius,this.startingAngle,this.closingAngle);
      ctx.fillStyle='white';
      ctx.fill();
    }
};

/****************************************************************************************************
                                          Ghost Class
Constructor takes in a position object, velocity object. Position object contains x and y values where
ghost will be drawn. Velocity object contains x and y value representing the 'velocity', which is the 
number of pixels the ghost will move in the x or y direction per frame. Color is ghosts color. Ghost
speed is static representing how many pixels the ghost will move per frame. Each ghost object has a 
prevCollisions array which contains strings representing the direction which would cause a collision. 
Ghost radius and angle represent the size/shape of ghost. Lastly, each ghost has a scared bool 
attribute which turns to true only when pacman eats a powerup. When ghost is scared they may not eat
pacwoman. When ghost is scared they are blue. 
*****************************************************************************************************/
class Ghost                                      
{
      static speed = 2

      constructor({position,velocity,color ='red'}) 
      {
      this.position = position
      this.velocity = velocity 
      this.speed = 2
      this.color = color
      this.prevCollisions = []                 
      this.startingAngle = Math.PI*2; 
      this.closingAngle = 0;
      this.radius = 15
      this.scared = false
    }

    drawGhost(){
      ctx.beginPath();                            
      ctx.arc(this.position.x,this.position.y,this.radius,this.startingAngle,this.closingAngle);
      ctx.fillStyle= this.scared ? 'blue': this.color //if they are scared they are blue, if not they are their normal color
      ctx.fill();
    }

    updateGhost(){
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.drawGhost();
    }  
};
/******************************************************************************************
                                Boundry Class
Boundry objects make up the map. Constructior takes in a position object and an image name. 
The drawBoundry method calls the draw image function which draws the specified image at the 
specified position. 
******************************************************************************************/
class Boundary                                   
{
  static width = 40;
  static height = 40;
  constructor({position,image})
  {
    this.position = position
    this.width = 40 
    this.height = 40
    this.image = image
  }
  
  drawBoundary()                                   
  {                                   
    ctx.drawImage(this.image,this.position.x,this.position.y)
  }
}

/*------------------------------------------------------------------------------------------------------------
              circleCollidesWithRectangle Function
Function takes in a circle object and a rectangle object, detects collision. 
Returns a bool true if a collision has been detected. 
-------------------------------------------------------------------------------------------------------------*/
function circleCollidesWithRectangle({circle,rectangle})
{
    const padding = Boundary.width/2 - circle.radius -1   //minus one so its not actually touching
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding             
    && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
    && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

/*---------------------------------------------------------------------------------------
                    checkEat Pellets Function
Checks for collision between pellets and pacman, circle to circle collision. If collision
pacman "eats" pellet. Remove pellet once eaten. No more pellets left then, win game. 
----------------------------------------------------------------------------------------*/
function checkEatPellets(){      
    for(let i = pellets.length-1;0 <= i; i--)
    {
      const pellet = pellets[i]
      pellet.drawPellet()
        if (Math.hypot(pellet.position.x - pacman.position.x,   //circle to circle collision
          pellet.position.y - pacman.position.y) < pellet.radius + pacman.radius)
        {
          pellets.splice(i,1)
          score +=10;
          scoreE.innerHTML =score
        }

         //Win condition if 0 pellets left
        if(pellets.length == 0)
        {
          console.log('You won!')
          ctx.font = "30px Comic Sans MS";
          ctx.fillStyle = "red";
          ctx.textAlign = "center";
          ctx.fillText("Winner", canvas.width/2, canvas.height/2);
          cancelAnimationFrame(animationId);//end game
        }
    }
}


/*---------------------------------------------------------------------------------------
                    checkEatPowerUps Function
Function calls the draw power up function to draw the power up. 
Function then checks if the pacman is colliding with the power up, if true, eat it. 
If pacman eats power up make ghosts scared for 5 seconds. 
----------------------------------------------------------------------------------------*/
function checkEatPowerUps(){
      for(let i = powerUps.length-1;0 <= i; i--)                    //iterate through the powerups
      {
        const powerUp = powerUps[i]
        powerUp.drawPowerUp()                                       //draw the power up
  
        //Check for collisions between pacman and powerup. If collision you "eat" the powerup
        if (Math.hypot(powerUp.position.x - pacman.position.x,      
          powerUp.position.y - pacman.position.y) < powerUp.radius + pacman.radius)
          {
            console.log('Power Up!')
            powerUps.splice(i,1)                                    //"Eat" power up, remove it from powerup array  
            ghosts.forEach(ghost =>
            {                                                       //Make all ghosts scared property set to true
              ghost.scared = true
              setTimeout(()=>{
                ghost.scared = false                                //Ghost scared property to false after 5 seconds
              }, 5000)
            })
          }
      }
}
/*---------------------------------------------------------------------------------------
                    checkGhostPacmanCollision Function
Checks for collision between ghost and pacman, circle to circle collision. 
----------------------------------------------------------------------------------------*/
function checkGhostPacmanCollision()
{
for(let i = ghosts.length-1;0 <= i; i--)              //Iterate through ghost array 
{
  const ghost = ghosts[i]                             //check for collison
    if (Math.hypot(ghost.position.x - pacman.position.x,
      ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius )
      {
        if(ghost.scared)                              //if collision, check if ghost is scared. 
        {
          ghosts.splice(i,1)                          //if ghost is scared and collision is true then removed the ghost from array 
        }
        else
        {
        cancelAnimationFrame(animationId)             //pass in the current frame to cancel the animation frame(stop the game)
        console.log("You lose!")
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width/2, canvas.height/2);
        }
      }
  }
}

/*---------------------------------------------------------------------------------------
                    checkChangePacmanVeloctiy Function
Function draws boundries and checks for collisions between pacman and draw boundries. 
Function "predicts" collisions before allowing pacman to move in a desired direction.
Desired direction is detected with event listers outside of this function which initialize
keys.pressed and lastKey. 
If no  collision is going to occur then allow pacman to change velocity. If desired velocity 
change would cause a collision then stop pacman, set velocity to zero. 
----------------------------------------------------------------------------------------*/
function checkChangePacmanVelocity()
{
    if (keys.up.pressed &&lastKey == 'up' )
    {             
        for(let i = 0; i<boundaries.length;i++)             //Loop through boundies array check for collision when up is pressed  
        {
            const boundary = boundaries[i]                                     
            if (circleCollidesWithRectangle({               //Test if predicted collision using a copy of the pacman and each boundry in the boudry array
              circle: {...pacman,velocity:{                 //Use spread operator to make deep copy of pacmans velocity object 
                x: 0,                 
                y: -5                                       //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
              }},                                           //pass current packman through while only editing its velocity 
              rectangle: boundary}))                  
            {                                               //If pacman collided with a boundry stop him
              pacman.velocity.y = 0                         //stop pacman if ANY boundry is predicted to be colliding and then break 
              break                                         //Break out do not check the other boundries after one collision has been found you cannot go up
            }
            else{
              pacman.velocity.y = -5                        //If there is no predicited collision let real pacman go up
            }
        }
    } 
    else if(keys.down.pressed && lastKey == 'down')         //Check if your able to move down using same steps as we did above
    {
      for(let i = 0; i<boundaries.length;i++)
      {
          const boundary = boundaries[i]               
          if (circleCollidesWithRectangle({
            circle: {...pacman,velocity:{           
              x: 0,
              y: 5                                
            }},                                 
            rectangle: boundary}))                                   
          {
            pacman.velocity.y = 0                              
            break                                          
          }
          else{
            pacman.velocity.y = 5                           
          }
      }      
    } 
    else if(keys.left.pressed && lastKey == 'left')       //Check if you should be able to move left using same steps as above
    {
      for(let i = 0; i<boundaries.length;i++)
      {
        const boundary = boundaries[i]             
          if (circleCollidesWithRectangle({
          circle: {...pacman,velocity:{           
            x: -5,
            y: 0                               
          }},                                 
          rectangle: boundary}))                 
          {
            pacman.velocity.x = 0                            
            break                                               
          }
          else{
          pacman.velocity.x = -5                          
        }
      } 
    } 
    else if(keys.right.pressed && lastKey == 'right')     //Check if you should be able to move right using same steps as above
    {
      for(let i = 0; i<boundaries.length;i++)
      {
        const boundary = boundaries[i]             
        if (circleCollidesWithRectangle({
          circle: {...pacman,velocity:{           
            x: 5,
            y: 0                              
          }},                                     
          rectangle: boundary}))                  
        {
          pacman.velocity.x = 0                               
          break                                             
        }
        else{
          pacman.velocity.x = 5                              
        }
      } 
    }

    //Check collision while going straight direction
      boundaries.forEach((boundary)=> 
      {                                   
        boundary.drawBoundary()           //Loop through boundries array & draw boundries
        if (
          circleCollidesWithRectangle({  //While looping through and drawing boundries also check if pacman if colliding with the boundary 
          circle: pacman,
          rectangle: boundary
        })
        ) {                              //If a collision occours while going straight then stop pacman
            pacman.velocity.x=0          //Reset pacmans x velocity 
            pacman.velocity.y=0          //Reset pacmans y velocity 
          }                                            
      }) 
}


/*---------------------------------------------------------------------------------------
                    checkGhostCollision function
Functions handles ghost AI (deciding where they will go next).
Function avoids collisions with boundries and updates ghost velocities. 
----------------------------------------------------------------------------------------*/
function checkGhostCollision(){
  //Loop through ghosts array for each ghost
  ghosts.forEach((ghost) =>
  {
        ghost.updateGhost();                                          //update ghost/redraw
        const currentCollisions = []                                  //Make an array to hold current collisions of this particular ghost

      boundaries.forEach(boundary=>                                   //Loop through every boundry
      {
        //Check right direction
          if (                        
            !currentCollisions.includes('right') &&                   //if the currentCollisions doesnt include "right" and your hitting the left side of a boundry
            circleCollidesWithRectangle({
              circle: 
              {
                  ...ghost,velocity:{                                 //Spread operator to make copy of current ghost so we can anticpate changing his veloctiy
                  x: ghost.speed,                                     //test on coppied object if you let velocity in positive x direction(right) = ghost speed which is 2 will collison occour?
                  y: 0                                
                }
              },                                      
              rectangle: boundary                                     //test against current boundry
            })
          ){
            currentCollisions.push('right')                           //If true then add "right" string to the currentCollisions
          }

        //Check left direction using same steps as above for "check right"
          if (
            !currentCollisions.includes('left') &&  
            circleCollidesWithRectangle({
              circle: {
                  ...ghost,velocity:{          
                  x: -ghost.speed,                                    //Set copied ghost obj x velocity to -ghost speed(-2) representing left direction         
                  y: 0                                
                }
              },                                    
              rectangle: boundary                                     //Check anticpated move left against each boundry
            })
          ){
            currentCollisions.push('left')                            //If left boundry will be a collision & "left" not in currentCollisons array then add it
          }

          //Check up direction direction using same steps as above for "check right"
          if (
            !currentCollisions.includes('up') &&  
            circleCollidesWithRectangle({
              circle: {
                  ...ghost,velocity:{           
                  x: 0,
                  y: -ghost.speed                                     //Set copied ghost obj y velocity to -ghost speed(-2) representing up direction           
                }
              },                                    
              rectangle: boundary                                     //Check anticpated move up against each boundry
            })
          ){
            currentCollisions.push('up')              
          }

          //Check down direction direction using same steps as above for "check right"
          if (
            !currentCollisions.includes('down') &&  
            circleCollidesWithRectangle({
              circle: {
                  ...ghost,velocity:{          
                  x: 0,
                  y: ghost.speed                                      //Set copied ghost obj y velocity to ghost speed(2) representing down direction              
                }
              },                                
              rectangle: boundary                                     //Check anticpated move down against each boundry 
            })
          ){
            currentCollisions.push('down')                            //If down boundry will be a collision & "down" not in currentCollisons array then add it
          }   
      })

      

      if(currentCollisions.length > ghost.prevCollisions.length)      //If ghost new position has greater # possile collisions than his last positions possible collisions
      {                                                               //then the # of available directions he may go has been reduced, then update it. 
      ghost.prevCollisions = currentCollisions                        //Update the ghosts prevCollisons array with current collisions
      }

                                                                      //If current collisions is different than his previous collisions then he has less collisions
      if (JSON.stringify(currentCollisions)                           //Than he did last frame so new pathways have opened up. 
      != JSON.stringify(ghost.prevCollisions))                        //Add his current direction to his "previous collisions" because will use this 
      {
        if(ghost.velocity.x>0)                                        //if ghost is traveling right add it to prev coll
        {
          ghost.prevCollisions.push('right')
        }
        else if(ghost.velocity.x<0)                                   //if ghost is traveling left add it to prev coll
        {
          ghost.prevCollisions.push('left')
        }
        else if(ghost.velocity.y<0)                                   //if ghost is traveling up add it to prev coll
        {
          ghost.prevCollisions.push('up')
        }
        else if(ghost.velocity.y>0)                                   //if ghost is traveling down add it to prev coll
        {
          ghost.prevCollisions.push('down')
        }
                                                                      //Create a "pathways" array holding the current possible pathwaysa ghost may take at any given second
        const pathways = ghost.prevCollisions.filter(collision =>     //The filter() method creates a new array filled w elements that pass a test provided by a function.
        {                                                             //Include any paths that were in previous collisions but are not in current collisions in to pathways
        return !currentCollisions.includes(collision)                 //This will return any "opened up" paths as well as the current direction the ghost is traveling in already  
        })

        const direction = pathways[Math.floor(Math.random() * pathways.length)]//Pick a random direction from your pathways.        
                                                                      //Random returns a float between 0 and 1. Take the floor so you get an int.                                                               
        switch(direction)                                             //change ghost velcotiy  based on the radnom direction chosen 
        {
          case 'down':
            ghost.velocity.y=ghost.speed
            ghost.velocity.x=0
            break
          case 'up':
            ghost.velocity.y=-ghost.speed
            ghost.velocity.x=0
            break
          case 'right':
            ghost.velocity.y=0
            ghost.velocity.x=ghost.speed
            break
          case 'left':
            ghost.velocity.y=0
            ghost.velocity.x=-ghost.speed
            break
        }
        ghost.prevCollisions =[]                                     //Reeset the collision now that your moving in a new direction
      }
    })
}

/*---------------------------------------------------------------------------------------
                    animate function
Controls game animation using requestAnimationFrame function. 
RequestAnimationFrame will call function passed into it in a continous loop. 
----------------------------------------------------------------------------------------*/
function animate() 
{   
    animationId = requestAnimationFrame(animate);            //RequestAnimationFrame with animate function. Return type int containing frame id 
    ctx.clearRect(0,0,canvas.width,canvas.height);           //Clear the canvas
    checkChangePacmanVelocity();                              //Check for changes in velocity based on keys pressed                                  
    checkEatPowerUps();                                       //Check if eating(colliding) a Powerup
    checkGhostPacmanCollision();                              //Check is colliding with a ghost
    checkEatPellets();                                        //Check if eating(colliding) a Pellet
    pacman.updatePacmanPosition();                            //Update and redraw pacman 
    checkGhostCollision();                                    //Ghost AI and collision detection
    pacman.rotatePacman();   
  }


  //Create a keys object with 4 key value pairs representing 4 directions
  const keys =
  {
    up:{
      pressed:false
    },
    down:{
      pressed:false
    },
    left:{
      pressed:false
    }, 
    right:{
      pressed:false
    }
  }

/*---------------------------------------------------
                    Event Listeners
----------------------------------------------------*/
 //Detect key down and update keys and last key
 addEventListener('keydown',({key}) => 
 {
   if (key === 'ArrowUp'){
     keys.up.pressed = true;
     lastKey='up'   
    } 
   else if (key === 'ArrowDown') {
     keys.down.pressed = true;
     lastKey='down'   
   } 
   else if (key === 'ArrowLeft') { 
    keys.left.pressed = true;
    lastKey='left'   
  } 
   else if (key === 'ArrowRight') {
      keys.right.pressed = true;
      lastKey='right'   
   }
 })

  //Detect when a key is released and update keys
  addEventListener('keyup',({key}) => 
  {   
    if (key === 'ArrowUp') {
      keys.up.pressed = false;
    } 
    else if (key === 'ArrowDown') {
      keys.down.pressed = false;
    } 
    else if (key === 'ArrowLeft'){ 
     keys.left.pressed = false;
    } 
    else if (key === 'ArrowRight') {
       keys.right.pressed = false;
    }
  })

/*---------------------------------------------------
                    Create Variables
----------------------------------------------------*/
let animationId = 0                                     //Holds the current frame number
let lastKey = ''                                        //Holds the lastKey presseed
let score =0                                            //Holds the current score
const boundaries = []                                   //Array to hold your boundary objects
const pellets = []                                      //Array to hold your pellet objects
const powerUps = []                                     //Array to hold your powerUp objects

/*---------------------------------------------------
            Create Ghost Objects
----------------------------------------------------*/
const ghosts = [
  new Ghost(
    {
    position:{
      x: Boundary.width*6 + Boundary.width/2,
      y: Boundary.height*1.5
    },
    velocity:{
      x:Ghost.speed,
      y:0
    },
    color: 'pink'
  }),
  new Ghost(
    {
    position:{
      x: Boundary.width*6 + Boundary.width/2,
      y: Boundary.height*1.5
    },
    velocity:{
      x:Ghost.speed,
      y:0
    },
    color: 'aqua'
  })
]

/*---------------------------------------------------
            Create Pacman Object
----------------------------------------------------*/
const pacman = new Pacman(
  {
    position:{
      x: Boundary.width*1.5,
      y:Boundary.height*1.5
    },
    velocity:{
      x:0,
      y:0
    }
  });


animate();



