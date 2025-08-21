// import { useNavigation } from '@react-navigation/native';

// const useNavigateToNextPage = () => {
//   const navigation = useNavigation();

//   const navigateToNextPage = (deliveryLocations, pickupLocation) => {
//     navigation.navigate('NextPage', {
//       deliveryLocations,
//       pickupLocation,
//     });
//   };

//   return navigateToNextPage;
// };

// export default useNavigateToNextPage;


import { useNavigation } from '@react-navigation/native';

const useNavigateToNext = () => {
  const navigation = useNavigation();

  const navigateToNext = () => {
    navigation.navigate('NextPage' as never);
  };

  return navigateToNext;
};

export default useNavigateToNext;
