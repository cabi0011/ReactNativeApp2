import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, FlatList, Platform, RefreshControl } from 'react-native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import UserAvatar from 'react-native-user-avatar';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-root-toast';

export default function App() {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (retryCount = 0) => {
    try {
      const response = await axios.get('https://random-data-api.com/api/users/random_user?size=10');
      setUsers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 429 && retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => fetchUsers(retryCount + 1), delay);
      } else {
        console.error('Error fetching users:', error);
      }
    }
  };

  const fetchOneUser = async () => {
    try {
      const response = await axios.get('https://random-data-api.com/api/users/random_user');
      setUsers([response.data, ...users]);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('Rate limit reached, please try again later');
        const showMessage = (message, duration) => {
          Toast.show(message, {
            duration: duration, 
            position: Toast.positions.BOTTOM, 
            shadow: true,
            animation: true,
            hideOnPress: true, 
            delay: 0, 
          });
        };
        showMessage('Rate limit reached, please try again later', Toast.durations.SHORT)
      } else {
        console.error('Error fetching user:', error);
      }
    }
  };  

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers().then(() => setRefreshing(false));
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {Platform.OS === 'android' && (
        <UserAvatar size={50} src={`${item.avatar}`} bgColor="lightgrey"  />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.first_name}</Text>
        <Text style={styles.name}>{item.last_name}</Text>
      </View>
      {Platform.OS === 'ios' && (
        <UserAvatar size={50} src={`${item.avatar}`} bgColor="lightgrey" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Icon
        name="add-circle"
        size={60}
        color="#000"
        style={styles.fab}
        onPress={fetchOneUser}
      />
      <StatusBar style="auto" />
    </View>
  );



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  name: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 35,
    right: 35,
  },
});
