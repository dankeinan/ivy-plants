import React from "react";
import { Text, StyleSheet, View } from "react-native";

export default function NotificationCard(props) {

    return(
        <View style={styles.notificationCard}>
            <Text style={styles.timestampText}>{props.timestamp}</Text>
            <Text style={styles.notificationContent}>{props.plantName}: {props.notificationContent}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    notificationCard: {
        padding: 10,
        marginRight:20,
        marginTop: 15,
        backgroundColor: '#d7e3cd',
        borderRadius: 10,
    },
    timestampText: {
        color: "#215221",
        fontSize: 14,
        fontWeight: 'bold',
        padding: 5
    },
    notificationContent: {
        color: "#215221",
        fontSize: 14,
        padding: 5
    }
})