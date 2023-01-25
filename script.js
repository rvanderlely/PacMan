const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');



//Animation 1 

const pacman = {
    x:300,
    y:300,
    size:30,
    dx:10,
    dy:4,
    startingangle:(1.8*Math.PI),
    closingangle:(Math.PI*.2),

    //for the mouth
    mouth1x:300,
    mouth1y:300,

}

function drawPacman(){
    ctx.beginPath();
    ctx.arc(pacman.x,pacman.y,pacman.size,pacman.startingangle,pacman.closingangle,true);
    ctx.lineTo(pacman.mouth1x,pacman.mouth1y);
    ctx.closePath(); //use this because idk the coordinates cant figure it out
    ctx.lineWidth=8;
    ctx.stroke();
    ctx.fillStyle='yellow';
    ctx.fill();
 }


 


//Sleep for ms to control chew speed
function sleepChew(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

//to make pacman "chew" using request animation frame. 
//Request animation frame takes in a call back which is the chew function
//Being called over and over again and repainting the canvas
async function chew()
{

    //Detect key down
    document.onkeydown = (e) => {
        e = e || window.event;
        if (e.key === 'ArrowUp') 
        {
          console.log('up arrow pressed')
        } 
        else if (e.key === 'ArrowDown') 
        {
          console.log('down arrow pressed')
        } 
        else if (e.key === 'ArrowLeft') 
        {
          ctx.clearRect(0,0,canvas.width,canvas.height)
          pacman.x -= pacman.dx;
          pacman.mouth1x -= pacman.dx;
          console.log('left arrow pressed')
        } 
        else if (e.key === 'ArrowRight') 
        {
            ctx.clearRect(0,0,canvas.width,canvas.height)
            pacman.x += pacman.dx;
            pacman.mouth1x += pacman.dx;
          console.log('right arrow pressed')
        }
      }
      //test


    //wait for ms and then clear the screen and draw open mouth pacman
    await sleepChew(100);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //Change his mouth to open
    pacman.startingangle = (1.8*Math.PI);
    pacman.closingangle = (Math.PI*.2);
    //draw
    drawPacman();

    //wait for ms and then clear the screen and draw closed mouth pacman
    await sleepChew(100);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // //Set mouth to closed
    pacman.startingangle =(0);
    pacman.closingangle = (Math.PI*2);
    //draw
    drawPacman();

    //Do it again...
    requestAnimationFrame(chew);
}


 chew();
