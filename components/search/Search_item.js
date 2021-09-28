import styles from "../../styles/Search.module.css"
import 'bootstrap/dist/css/bootstrap.min.css'
// import {useEffect,useState} from 'react'

const Search_item = ({setHideFilteredResult,item,setSingleSearchResult}) => {

    let lots_avail = Number(0)
    let lots_total = Number(0)
    for(var i in item.carpark_info){
        lots_avail = lots_avail + +item.carpark_info[i].lots_available
        lots_total = lots_total + +item.carpark_info[i].total_lots
    }

    const callbackSingleSearchResult = (i) =>{
        const single = i
        setHideFilteredResult(true)
        setSingleSearchResult(single)
    }

    return (
        <div onClick = {()=>callbackSingleSearchResult(item)} className = {`${styles.card} ${lots_avail==0?styles.full:''} ${lots_avail/lots_total>0 && lots_avail/lots_total<0.2?styles.almostFull:''}`}>
            <div className={styles.cardContent} style={{width:'100%'}}>
                <div className={styles.cp_num_availability}>
                    <p className={styles.cp_num}>{item.carpark_number}</p>
                    <p className=''>{lots_avail}/{lots_total}</p>
                </div>
                <div>
                    <p>{item.address}</p>
                </div>
            </div>
        </div>

    )
}

export default Search_item
