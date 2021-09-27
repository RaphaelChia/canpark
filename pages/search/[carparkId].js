import React from 'react'
import {useRouter} from 'next/router'
const searchResult = () => {
    const route = useRouter()

    return (
        <div>
            This page is {route.query.carparkId}    
        </div>
    )
}

export default searchResult
