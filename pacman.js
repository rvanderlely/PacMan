/*-----------------------------------------------------
              Canvas Setup
------------------------------------------------------*/
const canvas = document.getElementById('canvas'); //Create a canvas and give it a 2D context 
const ctx = canvas.getContext('2d');
const scoreE = document.getElementById('scoreE'); //Create a canvas and give it a 2D context 
canvas.width = 445
canvas.height = 525

/*-----------------------------------------------------
              startGame Function
------------------------------------------------------*/
function startGame()
{
toggleScreen('canvas',true)
toggleScreen('scoreboard',true)
toggleScreen('start-screen',false)

}
/*-----------------------------------------------------
              endGame Function
------------------------------------------------------*/
function endGame()
{
  toggleScreen('gameOver',true)
}

/*-----------------------------------------------------
              toggleScreen Function
------------------------------------------------------*/
function toggleScreen(id,toggle)
{
let element = document.getElementById(id);
let display = (toggle) ? 'block' : 'none'
element.style.display = display;
}

/*******************************************************
                      Pacman Class

********************************************************/
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

    //Update Pacman Position, direction and chomp feature 
    //Rotate direction of pacmans mouth depending on velococity(direction)
    //Using translate function. Only rotate pacman, then retranslate back. 
    updatePacmanPosition()
    {
      ctx.save()
      ctx.translate(this.position.x,this.position.y)      //rotate pacman
      ctx.rotate(this.rotation)
      ctx.translate(-this.position.x,-this.position.y)    //change back 
      this.drawPacman();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      //Pacman Chomp Feature 
      if(this.radians < 0 || this.radians > .75)
      {
       this.chompRate = -this.chompRate
      }
      this.radians += this.chompRate
      ctx.restore()
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

/*---------------------------------------------------------------------------------------
              circleCollidesWithRectangle Function
Function takes in a circle object and a rectangle object. 
GO BACK AND COMMENT HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
----------------------------------------------------------------------------------------*/
function circleCollidesWithRectangle({circle,rectangle})
{
    const padding = Boundary.width/2 - circle.radius -1   //minus one so its not actually touching
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding             
    && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
    && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
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
  const ghost = ghosts[i]
                                                      //check for collison
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
                    animate function
Controls  game animation using requestAnimationFrame function. 
RequestAnimationFrame will call function passed into it in a continous loop. 
----------------------------------------------------------------------------------------*/
function animate() 
{   
     animationId = requestAnimationFrame(animate);            //RequestAnimationFrame has return type int containing frame id 
     ctx.clearRect(0,0,canvas.width,canvas.height);           //Clear the canvas

                                                              //If up is currently pressed and was also last key pressed
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
      else if(keys.down.pressed && lastKey == 'down')        //Check if your able to move down using same steps as we did above
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

    checkEatPowerUps();

    checkGhostPacmanCollision();
    
// //dectect collison between ghost and player
//   for(let i = ghosts.length-1;0 <= i; i--)
//   {
//     const ghost = ghosts[i]

//       //collison between ghost and pacman
//       if (Math.hypot(ghost.position.x - pacman.position.x,
//         ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius )
//         {
//           if(ghost.scared)
//           {
//             ghosts.splice(i,1)
//           }
//           //Pacman dies 
//           else
//           {
//             cancelAnimationFrame(animationId) //pass in the current frame to cancel 
//             // console.log("You lose!")
//             // endGame();
//             ctx.font = "30px Comic Sans MS";
//           ctx.fillStyle = "red";
//           ctx.textAlign = "center";
//           ctx.fillText("Hello World", canvas.width/2, canvas.height/2);
//           }
//         }
//   }

      //eating the pellets and adding to score
      for(let i = pellets.length-1;0 <= i; i--)
      {
        const pellet = pellets[i]
        pellet.drawPellet()
        //diff between to x and two y coords 
        if (Math.hypot(pellet.position.x - pacman.position.x,
          pellet.position.y - pacman.position.y) < pellet.radius + pacman.radius)
        {
          pellets.splice(i,1)
          score +=10;
          scoreE.innerHTML =score
        }

         //Win condition goes here //his was not in this for loop but idk
         //THIS IS WHRER YOU CAN MAKE ANOTHER LEVEL
        if(pellets.length == 0)
        {
          console.log('You won!')
          cancelAnimationFrame(animationId)
        }
      }


      //This checks if you have hit a wall while going in a stright direction
      boundaries.forEach((boundary)=> 
      { //Loop through boundries array & draw boundries
          boundary.drawBoundary()
            if (
              circleCollidesWithRectangle({
              circle: pacman,
              rectangle: boundary
            })
            ) {
                pacman.velocity.x=0          //Reset pacmans velocity 
                pacman.velocity.y=0
              }                                            
      }) 
      
      pacman.updatePacmanPosition();     //Update and redraw pacman 
          
        //Loop through ghosts array
        ghosts.forEach((ghost) =>
        {
              ghost.updateGhost();          //update ghost/redraw
              const collisions = []         //Make an array to hold collisions

              //Loop through every boundry
            boundaries.forEach(boundary=>
            {
                if (
                  !collisions.includes('right') &&  //if the array doesnt already include right and your hitting the left side of a boundry
                  circleCollidesWithRectangle({
                    circle: 
                    {
                        ...ghost,velocity:{           //test what happens if you let velocity = - 5
                        x: ghost.speed,
                        y: 0                                //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
                      }
                    },                                    //pass current packman through while only editing its velocity 
                    rectangle: boundary
                  })
                ){
                  collisions.push('right')
                }
                if (
                  !collisions.includes('left') &&  //if the array doesnt already include left 
                  circleCollidesWithRectangle({
                    circle: {
                        ...ghost,velocity:{           //test what happens if you let velocity = - 5
                        x: -ghost.speed,
                        y: 0                                //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
                      }
                    },                                    //pass current packman through while only editing its velocity 
                    rectangle: boundary
                  })
                ){
                  collisions.push('left')
                }
                if (
                  !collisions.includes('up') &&  //if the array doesnt already include up
                  circleCollidesWithRectangle({
                    circle: {
                        ...ghost,velocity:{           //test what happens if you let velocity = - 5
                        x: 0,
                        y: -ghost.speed                               //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
                      }
                    },                                    //pass current packman through while only editing its velocity 
                    rectangle: boundary
                  })
                ){
                  collisions.push('up')
                }
                if (
                  !collisions.includes('down') &&  //if the array doesnt already includ down
                  circleCollidesWithRectangle({
                    circle: {
                        ...ghost,velocity:{           //test what happens if you let velocity = - 5
                        x: 0,
                        y: ghost.speed                               //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
                      }
                    },                                    //pass current packman through while only editing its velocity 
                    rectangle: boundary
                  })
                ){
                  collisions.push('down')
                }   
            })


            if(collisions.length > ghost.prevCollisions.length)
            {
            //If the current number of collisions is more than their previous number of collisions
            ghost.prevCollisions = collisions   //Take the current collisions for each ghost and save it to their personal array of collisions
            }

            //were going to "stringify" this using JSON. This allow you to test the actual strings stored inside the arrays. 
            //LOOK THIS UP MORE 
            if (JSON.stringify(collisions) != JSON.stringify(ghost.prevCollisions))//if the number of possible collisions changes, goes down
            {

              //get any other pathways that the ghost can travel by adding the 
              //direction they are currenly travleing to their previous collision
              //if ghost is traveling right
              if(ghost.velocity.x>0) 
              {
                ghost.prevCollisions.push('right')
              }
              //if ghost is traveling left
              else if(ghost.velocity.x<0) 
              {
                ghost.prevCollisions.push('left')
              }
              //if ghost is traveling up
              else if(ghost.velocity.y<0) 
              {
                ghost.prevCollisions.push('up')
              }
              //if ghost is traveling down
              else if(ghost.velocity.y>0) 
              {
                ghost.prevCollisions.push('down')
              }


              //console.log(collisions)
             // console.log(ghost.prevCollisions)
              //LOOK UP FILTER function
              //filter out any collisions that dont exsist in the first array 
              const pathways = ghost.prevCollisions.filter(collision => 
                {
                //if original collisions array does not include the collision were currently looping over
                return !collisions.includes(collision)
                })
                //console.log({pathways})
              //Change the ghosts velocity when theres been a change in the number of avaiable paths 
            
              //pick a random path from your pathways. Take the floor so you get an int 
              const direction = pathways[Math.floor(Math.random() * pathways.length)]

             // console.log({direction})

              //change velcotiy of ghost based on the direction
              switch(direction){
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
              
              //need to reeset the collision now that your moving in a new direction
              ghost.prevCollisions =[]
            }
          })

     //if pacman is going right 
     if(pacman.velocity.x > 0 ) pacman.rotation = 0
     else if(pacman.velocity.x < 0) pacman.rotation = Math.PI   
     else if(pacman.velocity.y > 0) pacman.rotation = Math.PI/2  
     else if(pacman.velocity.y < 0) pacman.rotation = Math.PI * 1.5 

  }//End of animate




/*******************************************************
                    Event Listeners
********************************************************/
 //Detect key down
 addEventListener('keydown',({key}) => 
 {
   if (key === 'ArrowUp') 
   {
     keys.up.pressed = true;
     lastKey='up'   
    } 
   else if (key === 'ArrowDown') 
   {
     keys.down.pressed = true;
     lastKey='down'   
   } 
   else if (key === 'ArrowLeft') 
   { 
    keys.left.pressed = true;
    lastKey='left'   
  } 
   else if (key === 'ArrowRight') 
   {
      keys.right.pressed = true;
      lastKey='right'   
   }
 })

  //Detect when a key is released
  addEventListener('keyup',({key}) => 
  {   
    if (key === 'ArrowUp') 
    {
      keys.up.pressed = false;
    } 
    else if (key === 'ArrowDown') 
    {
      keys.down.pressed = false;
    } 
    else if (key === 'ArrowLeft') 
    { 
     keys.left.pressed = false;
    } 
    else if (key === 'ArrowRight') 
    {
       keys.right.pressed = false;
 
    }
  })



  //create an object to determine which keys are being pressed down
  //Update these in the event listers
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

let animationId = 0                                         //Holds the current frame number
let lastKey = ''
let score =0


//Make an array to hold your boundry objects
const boundaries = []
const pellets = []
const powerUps = []

//Create Ghosts
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

// Create a new pacwoman
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

/*******************************************************
Main
********************************************************/
animate();



