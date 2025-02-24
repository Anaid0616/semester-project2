import { updateProfile } from '../../api/profile/updateAvatar.mjs';
import { fetchAndDisplayProfile } from '../../router/views/profileUser.mjs';
import { showAlert } from '../../utilities/alert.mjs';

export async function onUpdateProfile(event) {
  event.preventDefault(); // Prevent default form submission
  console.log('Profile update form submitted');

  // Retrieve form values
  const form = event.target;
  const avatar = form.avatar.value.trim();
  const bio = form.bio.value.trim();

  console.log('Form Values:', { avatar, bio });

  // Get the current user's data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.name) {
    showAlert('error', 'User not logged in. Cannot update profile.');
    return;
  }

  const username = user.name;

  try {
    // Prepare the data to send
    const updateData = {};
    if (avatar) updateData.avatar = { url: avatar };
    if (bio) updateData.bio = bio;

    console.log('Sending Update Data:', updateData);

    // Call the API to update the profile
    const updatedProfile = await updateProfile(username, updateData);

    console.log('API Response Status:', updatedProfile?.status);
    console.log('API Response JSON:', updatedProfile);

    // Check if the response includes a status or if meta is present
    if (!updatedProfile || !updatedProfile?.meta) {
      console.error(
        'Profile update failed or meta not found:',
        updatedProfile?.status,
        updatedProfile?.meta
      );
      showAlert('error', 'Failed to update profile. Please try again.');
      return;
    }

    // Update localStorage with the new profile data
    const updatedUserData = {
      ...user,
      name: updatedProfile.name || user.name,
      avatar: updatedProfile.data.avatar || user.avatar,
      bio: updatedProfile.data.bio || user.bio,
    };

    localStorage.setItem('user', JSON.stringify(updatedUserData));

    // Dynamically update the DOM using fetchAndDisplayProfile
    await fetchAndDisplayProfile();

    console.log('Profile updated successfully!');

    showAlert('success', 'Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    showAlert('error', 'Failed to update profile. Please try again.');
  }
}

// Add event listener to the profile update form
const updateProfileForm = document.querySelector(
  "form[name='updateProfileForm']"
);
if (updateProfileForm) {
  updateProfileForm.addEventListener('submit', onUpdateProfile);
} else {
  console.error('Update profile form not found in DOM.');
}
