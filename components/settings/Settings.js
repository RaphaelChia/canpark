import {useState, useEffect} from 'react'
import { FaOpera } from 'react-icons/fa'
import styles from './Settings.module.css'
const Settings = ({
                setShowSettings,
                setShowLL,
                showLL,
                setShowMultiStorey,
                ShowMultiStorey,
                setShowFreeParking,
                ShowFreeParking,
                setShowOpenSpaceParking,
                ShowOpenSpaceParking,
}) => {
    return (
        <div className={styles.SettingsBox + ' noSelectClick'} onBlur={() =>props.setShowSettings(false)}>
            <form className={styles.SettingsForm}>
                <label>
                    <div onClick = {(e) =>setShowLL(!showLL)} className = {`${styles.settingsItem} ${showLL?styles.settingsItemSelected:''}`}>Show LatLng</div>
                    {/* <input type="checkbox" value={props.showLL} checked={props.showLL}  onChange={(e)=>{props.setShowLL(e.currentTarget.checked)}} /> */}
                </label>
                <label>
                    <div onClick = {(e)=>setShowFreeParking(!ShowFreeParking)} className ={`${styles.settingsItem} ${ShowFreeParking?styles.settingsItemSelected:''}`}>Show Free Parking</div>
                    <span className = {styles.soon}>soon!</span>
                </label>
                <label>
                    <div onClick = {(e)=>setShowMultiStorey(!ShowMultiStorey)} className ={`${styles.settingsItem} ${ShowMultiStorey?styles.settingsItemSelected:''}`}>Show Multi-Storey</div>
                    <span className = {styles.soon}>soon!</span>
                </label>
                <label>
                    <div onClick = {(e)=>setShowOpenSpaceParking(!ShowOpenSpaceParking)} className ={`${styles.settingsItem} ${ShowOpenSpaceParking?styles.settingsItemSelected:''}`}>Show Open Carpark</div>
                    <span className = {styles.soon}>soon!</span>
                </label>
            </form>
        </div>
    )
}

export default Settings
