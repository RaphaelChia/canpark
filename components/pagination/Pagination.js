import { useState,useEffect } from "react"
import styles from './Pagination.module.css'
const Pagination = ({showSettings, setstartend,searchResult}) => {
    const tempRPP = 6
    const [page,SetPage] = useState(1)
    const [resultPerPage, setresultPerPage] = useState(tempRPP)

    useEffect(() => {
        updateResultSet()
    }, [page])

    useEffect(() => {
        updateResultSet()
    }, [resultPerPage])

    const updateResultSet = () => {
        const resultLength = searchResult.length
        const totalPages = Math.ceil(resultLength/resultPerPage)
        const newStartEnd = {start:(+page-1)*resultPerPage,end:+page*resultPerPage}
        setstartend(newStartEnd)
    }

    const incrementPage = () =>{
        const maxPage = Math.ceil(searchResult.length/resultPerPage)
        page+1<=maxPage?SetPage(page+1):SetPage(maxPage)
    }

    const decrementPage = () =>{
        page-1>0?SetPage(page-1):SetPage(1)
    }

    const update_rpp = (num) =>{
        num>0?setresultPerPage(num):setresultPerPage(tempRPP)

    }
    return (
        <div className = {styles.container}>
            <div className = {styles.paginationSettingsLayout}>
                {showSettings && <form className = {styles.paginationSettings} onSubmit = {(e)=>{
                    e.preventDefault()
                    update_rpp(e.currentTarget.input_rpp.value)
                }}>
                   <label>Results to show:
                   <input type="number" name ="input_rpp" onBlur={(e)=>
                       update_rpp(e.target.value)
                    }/>
                   </label>
                </form>}
            </div>
            {/* <div className={styles.pageNavigation} >
                <button onClick = {decrementPage}>{'<'}</button>
                Page {page}/{Math.ceil(searchResult.length/resultPerPage)}
                <button onClick = {incrementPage}>{'>'}</button>
            </div> */}
        </div>
    )
}

export default Pagination
