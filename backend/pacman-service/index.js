const express = require('express')
const cors = require('cors')
const app = express
const bodyParser = require('body-parser');
const port = 3000

app.use(cors())
app.use(bodyParser.json())


const GRID_SIZE = 20
const initialMaze = [
    '####################',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '#.......#####.......#',
    '#...................#',
    '####.....#.....#####',
    '#...................#',
    '#.......#####.......#',
    '#...................#',
    '#.......#...........#',
    '#...................#',
    '#.......#####.......#',
    '#...................#',
    '#.......#...........#',
    '#...................#',
    '####.....#.....#####',
    '#...................#',
    '#.......#####.......#',
    '####################',
];


const getGhostMove () => {
    return (
        dx: Math.sign(targetPos.x - ghostPos.x),
        dy: Math.sign(targetPos.y - ghostPos.y)
    )
}


app.get('/api/health', (request,response) => {
    response.status(200).send("okay")
})

app.post('/api/reset', (req, res) => {
    gameState = {
        maze = [...initialMaze], 
        pacmanPos = {x: 1, y :1}, 
        score = 0,
        ghosts = [ 
            {position: {x: 18, y = 1}, color : 'red', id : 1},
            {position : { x: 5, y = 10}, color: 'blue', id :2}, 
            {position: {x: 5, y = 5}, color: "yellow", id : 3} 
        ]


    }
})[]


// move player

app.post('/v1/api/string', (req,res)=> {
    console.log("hello world ")
})


// update game state on server



//check function if pacman collide with ghost



//port 
app.listen(PORT, () => {
    console.log('pacman run on ${PORT}')
})


