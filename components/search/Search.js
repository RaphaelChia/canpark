import {useEffect,useState } from "react"
import Search_item from "./Search_item"
// import 'bootstrap/dist/css/bootstrap.min.css'
import styles from "../../styles/Search.module.css"
import Pagination from "../pagination/Pagination"
import Settings from "../settings/Settings"
import Map from "./Map"
import {FaCog, FaSpinner} from 'react-icons/fa'
// import { debounce,isWithinMap } from "../../pages"
import { debounce,isWithinMap,SVY21 } from "../../utils"
// import { debounce } from "../../pages"

const Search = ({mapboxkey}) => {
    const [searchResult, SetSearchResult] = useState([])
    const [FilteredResult, setFilteredResult] = useState(searchResult)
    const [ShowSettings, setShowSettings] = useState(false)
    const [KeywordSearch, setKeywordSearch] = useState("")
    const [ResultLoaded, setResultLoaded] = useState(true)


    
    // Settings 
    const tempRPP = 6
    const [ResultPerPage, setResultPerPage] = useState(tempRPP)
    const [ShowLL, setShowLL] = useState(true)
    const [ShowFreeParking,setShowFreeParking] = useState(false)
    const [ShowMultiStorey,setShowMultiStorey] = useState(false)
    const [ShowOpenSpaceParking,setShowOpenSpaceParking] = useState(false)
    const [startend, setstartend] = useState({start:0,end:ResultPerPage})

 
    useEffect(() => {
        const load_api = async() => {
            let carparkData = null
            while(true){
                carparkData = await getHDBCarParkAvailabilityInfo()
                if (carparkData){
                    break
                }
            }
            SetSearchResult(carparkData.items[0].carpark_data)
            setFilteredResult([])
        }
        load_api()
    }, [])


    useEffect(() => {
        updateFilteredResultsByKW()
    }, [KeywordSearch])

    

    const updateFilteredResultsByKW = async () =>{
        setResultLoaded(false)
        if(KeywordSearch.length==0){
            setResultLoaded(true)
            setFilteredResult([])
            return
        }
        try {
            // Basically trying to merge 2 different API results into 1 object
            const data = await getCarParkDetails(KeywordSearch)
            const finalList = []
            for(var x in data.result.records){
                const fil2 = searchResult.filter((item)=>(
                    item.carpark_number.toLowerCase() === data.result.records[x].car_park_no.toLowerCase()
                ))
                if(fil2.length>0){
                    finalList.push(Object.assign(data.result.records[x],fil2[0]))
                }
            }
            setFilteredResult(finalList)
        } catch (error) {
            console.error("Error Occurred",error)
        }
        setResultLoaded(true)
        
    }

    const getCarParkDetails = async (kw) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CARPARK_INFO_URL}&limit=5000${kw?'&q='+kw:''}`)
        const data = await res.json()
        return data
        //Will only return 100 data, need to go next link to get next.
    }

    
    
    const getHDBCarParkAvailabilityInfo = async () =>{
        const res = await fetch(process.env.NEXT_PUBLIC_HDBCARPARK_AVAIL_URL)
        const data = await res.json()
        return data
    }
    
    // const getURAToken = async() =>{
    //     let headers = new Headers()
    
    //     headers.append('AccessKey',process.env.NEXT_PUBLIC_URAACCESSKEY)

    //     const res = await fetch(process.env.NEXT_PUBLIC_URACARPARK_TOKEN_URL,{
    //         method:'GET',
    //         headers:headers,
    //     })
    //     const data = await res.json()
    //     console.log(data.Result)
    //     return data.Result
    // }
    // const getURACarParksInfo = async () =>{
    //     const res = await fetch(process.env.NEXT_PUBLIC_URACARPARK_INFO_URL)
    //     const data = await res.json()
    //     return data
    // }

    const getCarParkFilteredByCoord = async(mapCoords) =>{
        console.log("attemping to get carparks")
        const cpd = await getCarParkDetails()
        const records = cpd.result.records
        const s = new SVY21()
        const recordsWithinViewport = records.filter((item)=>isWithinMap(s.computeLatLon(item.y_coord,item.x_coord),
        mapCoords))
        for(var x in recordsWithinViewport){
            const fil2 = searchResult.filter((item)=>(
                item.carpark_number.toLowerCase() === recordsWithinViewport[x].car_park_no.toLowerCase()
            ))
            if(fil2.length>0){
                Object.assign(recordsWithinViewport[x],fil2[0])
            }
        }
        // console.log(recordsWithinViewport)
        return recordsWithinViewport
    }



    const toggleShowSettings = () =>{
        setShowSettings(!ShowSettings)
        // getLocation()
    }

    const setKeyword_debounce = debounce(
        (e)=>setKeywordSearch(e.target.value.replace(/[^a-zA-Z\d]/ig, "")),
        300)


    return (
        <div className={styles.container}>
            <Map getCarparks = {getCarParkFilteredByCoord} showLL = {ShowLL}/>
            <form className={styles.searchbar} onSubmit = {(e)=>{e.preventDefault()}}>
                <input autoComplete="off" type="text" placeholder="Search" name ="search_keyword" onKeyUp={setKeyword_debounce} />  
                {!ResultLoaded && <FaSpinner className ={styles.searchSpinner}></FaSpinner>}
                <div className={styles.settings_btn} onClick={toggleShowSettings}>
                    <FaCog/>
                </div>
            </form>
            
            <div className={`${styles.cardrows}`}>
                {FilteredResult.map((sr,index)=>(
                    KeywordSearch.length>0 && index>=startend.start && index<startend.end && <Search_item item={sr} key={index}/>
                ))}
            </div>
            
            {ShowSettings && <Settings 
                setShowSettings={setShowSettings} 
                setShowLL = {setShowLL} 
                showLL = {ShowLL}
                setShowMultiStorey = {setShowMultiStorey}
                ShowMultiStorey = {ShowMultiStorey}
                setShowFreeParking = {setShowFreeParking}
                ShowFreeParking = {ShowFreeParking}
                setShowOpenSpaceParking = {setShowOpenSpaceParking}
                ShowOpenSpaceParking = {ShowOpenSpaceParking}/>}
            {/* <Pagination showSettings = {ShowSettings} setstartend = {setstartend} searchResult = {FilteredResult}></Pagination> */}
            
        </div>
    )
}
export default Search
