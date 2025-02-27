import { updateProfile } from '../../api/profile/updateAvatar.mjs';
import { fetchAndDisplayProfile } from '../../router/views/profileUser.mjs';
import { showAlert } from '../../utilities/alert.mjs';

export async function onUpdateProfile(event) {
  event.preventDefault(); // Prevent default form submission

  // Retrieve form values
  const form = event.target;
  const avatar = form.avatar.value.trim();
  const bio = form.bio.value.trim();

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

    // Call the API to update the profile
    const updatedProfile = await updateProfile(username, updateData);

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
      name: updatedProfile.data.name || user.name,
      avatar: updatedProfile.data.avatar || user.avatar,
      bio: updatedProfile.data.bio || user.bio,
    };

    localStorage.setItem('user', JSON.stringify(updatedUserData));

    // Dynamically update the DOM using fetchAndDisplayProfile
    await fetchAndDisplayProfile();

    showAlert('success', 'Profile updated successfully!');

    //  Close the form and reset button text
    const updateProfileForm = document.getElementById('update-profile');
    const updateProfileButton = document.getElementById(
      'update-profile-button'
    );

    if (updateProfileForm && updateProfileButton) {
      updateProfileForm.style.display = 'none';
      updateProfileButton.textContent = 'Update Profile';
      console.log('Form closed and button text reset to "Update Profile".');

      // Reattach click event to update profile button
      updateProfileButton.onclick = () => {
        const isHidden = updateProfileForm.style.display === 'none';
        updateProfileForm.style.display = isHidden ? 'block' : 'none';
        updateProfileButton.textContent = isHidden
          ? 'Cancel Update'
          : 'Update Profile';
        console.log(`Profile form ${isHidden ? 'shown' : 'hidden'}`);
      };
    }
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
