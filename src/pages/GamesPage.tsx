import React from "react"
import { useNavigate } from "react-router-dom"
import { HomeButton } from "./Home"
import { ArrowLeft } from "lucide-react"

const GamesPage: React.FC = () => {
   const navigate = useNavigate()
   const handleChessClick = () => navigate('/chessgame')
   const handlePacmanClick = () => navigate('/pacmangame')
   const handleBackClick = () => navigate('/')

   return (
       <div className="h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-blue-600 to-purple-600">
           <button 
               onClick={handleBackClick}
               className="absolute top-4 left-4 text-white hover:text-gray-200"
           >
               <ArrowLeft size={32} />
           </button>
           <div className="flex flex-col items-center">
               <h1 className="text-4xl font-bold mb-12 text-white">Games</h1>
               <div className="flex flex-col gap-8">
                   <HomeButton 
                       className="h-32 w-32 text-xl" 
                       imgPath="chess_icon.png" 
                       onClick={handleChessClick}
                   >
                       Chess
                   </HomeButton> 
                   <HomeButton 
                       className="h-32 w-32 text-xl rounded-full" 
                       imgPath="pacman_icon.png" 
                       onClick={handlePacmanClick}
                   >
                       Pacman
                   </HomeButton>
               </div>
           </div>
       </div>
   )
}

export default GamesPage