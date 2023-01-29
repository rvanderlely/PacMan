

const canvas = document.getElementById('canvas'); //Create a canvas and give it a 2D context 
const ctx = canvas.getContext('2d');
const scoreE = document.getElementById('scoreE'); //Create a canvas and give it a 2D context 
canvas.width = 445
canvas.height = 525



class Pacman                                      //Create a pacman class that takes in a position and veloctiy object 
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
      ctx.beginPath();                            //x,y is the center of the pacman 
      ctx.arc(this.position.x,this.position.y,this.radius,(this.startingAngle - this.radians) ,(this.closingAngle + this.radians ),true);
      ctx.lineTo(this.position.x,this.position.y);
      ctx.lineWidth=8;
      ctx.stroke();
      ctx.fillStyle='yellow';
      ctx.fill();
    }

    updatePacmanPosition(){
      ctx.save() //look this up //we only want to rotate pacman llook up translate and rotate
      ctx.translate(this.position.x,this.position.y)
      ctx.rotate(this.rotation)
      ctx.translate(-this.position.x,-this.position.y) //change back 
      this.drawPacman();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      //make the mouth chomp
      if(this.radians < 0 || this.radians > .75)
      {
       this.chompRate = -this.chompRate

      }
      this.radians += this.chompRate
      ctx.restore()
    }  
  
};

class Pellets                                      //Create a pacman class that takes in a position and veloctiy object 
{
      constructor({position}) {
      this.position = position
      this.startingAngle = Math.PI*2; 
      this.closingAngle = 0;
      this.radius = 3
    }
    drawPellet(){
      ctx.beginPath();                            //x,y is the center of the pacman 
      ctx.arc(this.position.x,this.position.y,this.radius,this.startingAngle,this.closingAngle);
      ctx.fillStyle='white';
      ctx.fill();
    }
};

class PowerUp                                      //Create a pacman class that takes in a position and veloctiy object 
{
      constructor({position}) {
      this.position = position
      this.startingAngle = Math.PI*2; 
      this.closingAngle = 0;
      this.radius = 10
    }
    drawPowerUp(){
      ctx.beginPath();                            //x,y is the center of the pacman 
      ctx.arc(this.position.x,this.position.y,this.radius,this.startingAngle,this.closingAngle);
      ctx.fillStyle='white';
      ctx.fill();
    }
};



class Ghost                                      //Create a gohst class that takes in a position and veloctiy object 
{
    static speed = 2
    constructor({position,velocity,color ='red'}) {
      this.position = position
      this.velocity = velocity 
      this.speed = 2
      this.color = color
      this.prevCollisions = []                  //Each instance of a ghost will have its own array of previous collisions
      this.startingAngle = Math.PI*2; 
      this.closingAngle = 0;
      this.radius = 15
      this.scared = false
    }

    drawGhost(){
      ctx.beginPath();                            //x,y is the center of the pacman 
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

class Boundary                                    //Create a boundry class that takes in a position object
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
  
  drawBoundary()                                  //Boundry Class method to draw a boundry 
    {                                   
      ctx.drawImage(this.image,this.position.x,this.position.y)
    }
}




//Function detect collision between a circle and a rectangle
function circleCollidesWithRectangle({circle,rectangle})
{
    const padding = Boundary.width/2 - circle.radius -1   //minus one so its not actually touching
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding             
    && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
    && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

  //An infinite loop called animate to redraw pacman and the map
  let animationId = 0                                       //Holds the current frame number
  function animate() 
  {   
     animationId = requestAnimationFrame(animate);            //Infinte loop RAF actually has a return type. It returns the frame number 
                                                              //we will need this frame number for starting and pausing our game
      ctx.clearRect(0,0,canvas.width,canvas.height);          //Clear the canvas

      //Check if you should be allowed to move down
      if (keys.up.pressed &&lastKey == 'up' )
      {                //When up key is pressed
          for(let i = 0; i<boundaries.length;i++)
          {
              const boundary = boundaries[i]               //Loop through boundies and check for collision when up is pressed                         
              //If you have a collision between the new copied pacman object with a changed velocity of -5 then break
              //else if theres no collision you are allowed to change the original pacmans velocity to -5 
              if (circleCollidesWithRectangle({
                circle: {...pacman,velocity:{           //test what happens if you let velocity = - 5
                  x: 0,
                  y: -5                                //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
                }},                                    //pass current packman through while only editing its velocity 
                rectangle: boundary}))                                             //Spread operator to copy pacman object and edit the velcotiy 
              {
                pacman.velocity.y = 0                               //stop pacman if ANY boundry is colliding 
                break                                               //Break out do not check the other boundries after one collision has been found you cannot go up
              }
              else{
                pacman.velocity.y = -5                              //If there is no predicited collision pacman go up
              }
          }
      } 
      
      //Check if your able to move down
      else if(keys.down.pressed && lastKey == 'down')
      {
        for(let i = 0; i<boundaries.length;i++)
        {
            const boundary = boundaries[i]               //Loop through boundies and check for collision when up is pressed                         
            //If you have a collision between the new copied pacman object with a changed velocity of -5 then break
            //else if theres no collision you are allowed to change the original pacmans velocity to -5 
            if (circleCollidesWithRectangle({
              circle: {...pacman,velocity:{           //test what happens if you let velocity = - 5
                x: 0,
                y: 5                                //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
              }},                                    //pass current packman through while only editing its velocity 
              rectangle: boundary}))                                             //Spread operator to copy pacman object and edit the velcotiy 
            {
              pacman.velocity.y = 0                               //stop pacman if ANY boundry is colliding 
              break                                               //Break out do not check the other boundries after one collision has been found you cannot go down
            }
            else{
              pacman.velocity.y = 5                              //If there is no predicited collision pacman go down
            }
        }      
      } 
      //Check if you should be able to move left
      else if(keys.left.pressed && lastKey == 'left')
      {
        for(let i = 0; i<boundaries.length;i++)
        {
            const boundary = boundaries[i]               //Loop through boundies and check for collision when up is pressed                         
            //If you have a collision between the new copied pacman object with a changed velocity of -5 then break
            //else if theres no collision you are allowed to change the original pacmans velocity to -5 
            if (circleCollidesWithRectangle({
              circle: {...pacman,velocity:{           //test what happens if you let velocity = - 5
                x: -5,
                y: 0                                //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
              }},                                    //pass current packman through while only editing its velocity 
              rectangle: boundary}))                  //Called the Spread operator to copy pacman object and edit the velcotiy 
            {
              pacman.velocity.x = 0                               //stop pacman if ANY boundry is colliding 
              break                                               //Break out do not check the other boundries after one collision has been found you cannot go left
            }
            else{
              pacman.velocity.x = -5                              //If there is no predicited collision pacman go left
            }
        } 
      } 
      else if(keys.right.pressed && lastKey == 'right')
      {
        for(let i = 0; i<boundaries.length;i++)
        {
            const boundary = boundaries[i]               //Loop through boundies and check for collision when up is pressed                         
            //If you have a collision between the new copied pacman object with a changed velocity of -5 then break
            //else if theres no collision you are allowed to change the original pacmans velocity to -5 
            if (circleCollidesWithRectangle({
              circle: {...pacman,velocity:{           //test what happens if you let velocity = - 5
                x: 5,
                y: 0                                //use the copy of pacman that you made to change ONLY the veloctiy to test for is a collision would occour 
              }},                                    //pass current packman through while only editing its velocity 
              rectangle: boundary}))                  //Called the Spread operator to copy pacman object and edit the velcotiy 
            {
              pacman.velocity.x = 0                               //stop pacman if ANY boundry is colliding 
              break                                               //Break out do not check the other boundries after one collision has been found you cannot go right
            }
            else{
              pacman.velocity.x = 5                              //If there is no predicited collision pacman go right
            }
        } 
      }



//PACMAN POWER UP
//for drawing power ups and deteting for collision and eating them
for(let i = powerUps.length-1;0 <= i; i--)
{
  const powerUp = powerUps[i]
  powerUp.drawPowerUp()

  if (Math.hypot(powerUp.position.x - pacman.position.x,
    powerUp.position.y - pacman.position.y) < powerUp.radius + pacman.radius)
    {
      console.log('Power Up!')
      powerUps.splice(i,1)

      //make ghosts scared
      //loop over every ghost
      ghosts.forEach(ghost =>{
        ghost.scared = true
        //here the ghost is scared

        setTimeout(()=>{
          ghost.scared = false
          //ghost not scared anymore after 5 seconds
        }, 5000)
      })

    }
}
//dectect collison between ghost and player
  for(let i = ghosts.length-1;0 <= i; i--)
  {
    const ghost = ghosts[i]

      //collison between ghost and pacman
      if (Math.hypot(ghost.position.x - pacman.position.x,
        ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius )
        {
          if(ghost.scared)
          {
            ghosts.splice(i,1)
          }
          else
          {
            cancelAnimationFrame(animationId) //pass in the current frame to cancel 
            console.log("You lose!")
          }
        }
  }

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


let lastKey = ''
let score =0


//Make an array to hold your boundry objects
const boundaries = []
const pellets = []
const powerUps = []
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

// Make a pacman girl 
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




  function createImage(src)
  {
  const image = new Image()
  image.src = src
  return image
  }    

  //Create an array to simulate your map
  const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
  ]
  
  // Additional cases (does not include the power up pellet that's inserted later in the vid)
  map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '-':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/pipeHorizontal.png')
            })
          )
          break
        case '|':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/pipeVertical.png')
            })
          )
          break
        case '1':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/pipeCorner1.png')
            })
          )
          break
        case '2':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/pipeCorner2.png')
            })
          )
          break
        case '3':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/pipeCorner3.png')
            })
          )
          break
        case '4':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/pipeCorner4.png')
            })
          )
          break
        case 'b':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./images/block.png')
            })
          )
          break
        case '[':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./images/capLeft.png')
            })
          )
          break
        case ']':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./images/capRight.png')
            })
          )
          break
        case '_':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./images/capBottom.png')
            })
          )
          break
        case '^':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./images/capTop.png')
            })
          )
          break
        case '+':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./images/pipeCross.png')
            })
          )
          break
        case '5':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./images/pipeConnectorTop.png')
            })
          )
          break
        case '6':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./images/pipeConnectorRight.png')
            })
          )
          break
        case '7':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./images/pipeConnectorBottom.png')
            })
          )
          break
        case '8':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./images/pipeConnectorLeft.png')
            })
          )
          break
          case '.':
            pellets.push(
              new Pellets({
                position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
                },
              })
            )
            break
            case 'p':
          powerUps.push(
            new PowerUp({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              },
            })
          )
          break
        }
      })
    })











