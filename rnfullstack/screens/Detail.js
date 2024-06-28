import { View, Text, Image } from 'react-native'
import React, { useState, useEffect } from 'react'

const Detail = ({ route }) => {
    const [item, setItem] = useState({})
    const [isLoading, setIsLoading] = useState(true)
  
    useEffect(() => {
        fetch('http://10.0.2.2:5000/api/food_database/'+route.params.menu_id)
            .then(res => res.json())
            .then((result) => {
                setItem(result)
                setIsLoading(false)
            })
    }, [])
  
  return (
    <View>
        { isLoading ?
            <Text>Loading</Text>
        :
            <View>
                <Image source={{ uri: item.menu_image}}
                    style={{ width: "100%", height: 333 }} />
                <View style={{ padding: 10}}>
                    <Text style={{ fontSize: 20 }}>{item.menu_name}</Text>
                    <Text>{item.menu_detail}</Text>
                </View>
            </View>
        }
    </View>
  )
}

export default Detail