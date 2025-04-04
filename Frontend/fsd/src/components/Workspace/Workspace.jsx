import React from 'react'
import Chat from './Chat'
import TaskManager from './TaskManager'
import { useNavigate } from 'react-router-dom'

const Workspace = () => {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    }
  return (
    <div>
        <button onClick={handleGoBack}>
            Go Back
        </button>
      <Chat />
      <TaskManager/>
    </div>
  )
}

export default Workspace
