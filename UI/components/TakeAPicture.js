import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';

export default function TakeAPicture() {

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState(null);

  // camera ref to access camera
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePhoto = async () => {
      if (cameraRef) {
          try {
              let photo = await cameraRef.current.takePictureAsync({
                  allowsEditing: true,
                  aspect: [16, 9],
                  quality: 1,
              });
              return photo;
          } catch (e) {
            console.log(e);
          }
      }
  };

  return (
    <View style={styles.container}>
      { showCamera ? <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
                <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={async ()=> {
                const r = await takePhoto();
                if (!r.cancelled) {
                    setImage(r.uri);
                }
                setShowCamera(false);
            }}
            >
                <Text style={styles.text}> Photo </Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.button}
              onPress={async () => {
              setShowCamera(false);
              }}
            >
                <Text style={styles.text}> Cancel </Text>
          </TouchableOpacity>
        </View>
      </Camera> : 
      <View style={styles.camera}>
          <View style={{alignItems:'center'}}>
            {image && (
                <Image source={{uri: image}} style={{width: '90%', height: '90%'}}/>
            )}
          </View>
          <View style={{flex: 1}}>
            <TouchableOpacity
                style={styles.regularButtonContainer}
                onPress={() => setShowCamera(true)}
            >
                <Text>Take a picture</Text>
            </TouchableOpacity>
          </View>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        
    },
    camera: {
        width: '90%',
        height: '90%'
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: "row",
        margin: 20,
        
    },
    button: {
        flex: 1,
        alignSelf: "flex-end",
        alignItems: 'center'
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    },
    regularButtonContainer: {
        height: 40,
        width: 160,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d7e3cd',
        marginTop: 10,
        borderRadius: 10,
    }
});