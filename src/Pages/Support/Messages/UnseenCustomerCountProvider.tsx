import React, {useEffect, useState} from 'react';
import {useSocket} from '../../../Context/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../../Redux/Store';
import {fetchMessagesForUser} from '../../../Redux/Messages/Messages';

const UnseenCustomerCountProvider = () => {
  const {socket} = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const [unseenCustomerCount, setUnseenCustomerCount] = useState(0);
  const [messagesFetched, setMessagesFetched] = useState([]);
  const [messages, setMessages] = useState([]);

  // Fetch user ID from AsyncStorage and join socket room
  const getUserData = async () => {
    try {
      const tempId = await AsyncStorage.getItem('temp_id');
      const userId = tempId || '';
      socket.emit('sendMessageSupportRoom', userId); // Ensure user joins a room based on userId

      dispatch(fetchMessagesForUser(userId))
      .then(response => {
        const fetchedMessages = response.payload;
        setMessagesFetched(fetchedMessages);

        // Count unseen messages from the fetched list
        const initialUnseenCount = fetchedMessages.filter(
          msg => msg.seenCustomer === false,
        ).length;

        console.log('Initial unseen customer messages:', initialUnseenCount);
        setUnseenCustomerCount(initialUnseenCount);
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });


    } catch (error) {
      console.error('Error fetching user ID from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // useEffect(() => {
  //   // Fetch messages for the user on component mount
  //   dispatch(fetchMessagesForUser())
  //     .then(response => {
  //       const fetchedMessages = response.payload;
  //       setMessagesFetched(fetchedMessages);

  //       // Count unseen messages from the fetched list
  //       const initialUnseenCount = fetchedMessages.filter(
  //         msg => msg.seenCustomer === false,
  //       ).length;

  //       console.log('Initial unseen customer messages:', initialUnseenCount);
  //       setUnseenCustomerCount(initialUnseenCount);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching messages:', error);
  //     });
  // }, [dispatch]);

  useEffect(() => {
    socket.on('messageSeenUpdatedCustomer', data => {
      console.log('DmessageSeenUpdatedCustomert:', data);
       const {message, seenCustomer} = data;
    });

    socket.on('receiveSupportMessage', data => {
      console.log('Data received from socket:', data);
      const {message, seenCustomer} = data;

      // Construct a new message for the frontend
      const newMessage = {
        content: message,
        sender: data?.sender,
        timestamp: new Date().toLocaleTimeString(),
        seenCustomer, // Track if the message was seen by the customer
      };

      // Update unseen customer count
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, newMessage];

        // Count unseen customer messages
        const unseenCount =
          messagesFetched.filter(msg => msg.seenCustomer === false).length +
          updatedMessages.filter(msg => msg.seenCustomer === false).length;

        setUnseenCustomerCount(unseenCount);
        console.log('Updated unseen customer count:', unseenCount);

        return updatedMessages;
      });
    });

    // Cleanup socket listener when component unmounts
    return () => {
      socket.off('receiveSupportMessage');
    };
  }, [socket, messagesFetched]);

  // Export the unseen customer count
  return unseenCustomerCount;
};

export default UnseenCustomerCountProvider;
