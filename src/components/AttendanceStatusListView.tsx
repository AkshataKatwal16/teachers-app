import { Box, Typography } from '@mui/material';

import { ATTENDANCE_ENUM } from '../utils/Helper';
import {
  AttendanceStatusListViewProps,
  UserData,
  updateCustomField,
} from '../utils/Interfaces';
import { BorderBottom } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel'; //absent
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; //present
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import LearnerModal from './LearnerModal';
import { getUserDetails } from '@/services/ProfileService';
import Loader from './Loader';

const AttendanceStatusListView: React.FC<AttendanceStatusListViewProps> = ({
  isDisabled = false,
  showLink = false,
  userData,
  isEdit = false,
  isBulkAction = false,
  handleBulkAction = () => {},
  bulkAttendanceStatus = '',
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();

  const boxStyling = {
    display: 'flex',
    height: isBulkAction ? '56px' : '',
    // width: '100%',
    // borderBottom: `0.5px solid ${theme.palette.warning[400]}`,
    padding: isBulkAction ? '0 8px' : '0 8px',
    alignItems: 'center',
    borderRadius: isBulkAction ? '8px' : 0,
    // marginBottom: '12px',
    backgroundColor: isBulkAction ? theme.palette.warning[800] : 'none',
    // position: isBulkAction ? 'fixed' : 'none',
    // width: isBulkAction ? '89%' : '100%',
    borderBottom: isBulkAction ? 'none' : '1px solid #D0C5B4',
  };

  const handleClickAction = (
    isBulkAction: boolean,
    selectedAction: string,
    id?: string
  ) => {
    if (isEdit) {
      handleBulkAction(isBulkAction, selectedAction, id);
    }
  };

  // -----learner profile  details----
  const [usersData, setUsersData] = React.useState<UserData | null>(null);
  const [customFieldsData, setCustomFieldsData] = React.useState<
    updateCustomField[]
  >([]);
  const [userName, setUserName] = React.useState('');
  const [isModalOpenLearner, setIsModalOpenLearner] = useState(false);
  const [loading, setLoading] = useState(false);
  // const userId = '12345'; // Replace with the actual user ID you want to pass

  const handleOpenModalLearner = (userId: string) => {
    fetchUserDetails(userId);
    setIsModalOpenLearner(true);
  };

  const handleCloseModalLearner = () => {
    setIsModalOpenLearner(false);
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      if (userId) {
        setLoading(true);
        const response = await getUserDetails(userId, true);
        console.log('response for popup', response?.result);
        if (response?.responseCode === 200) {
          const data = response?.result;
          if (data) {
            const userData = data?.userData;
            // setUsersData(userData);
            setUserName(userData?.name);

            const customDataFields = userData?.customFields;
            if (customDataFields?.length > 0) {
              console.log('customDataFields', customDataFields);
              setCustomFieldsData(customDataFields);
            }
            setLoading(false);
          } else {
            console.log('No data Found');
          }
        } else {
          console.log('No Response Found');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const names = [
    'name',
    'age',
    'gender',
    'student_type',
    'enrollment_number',
    'primary_work',
  ];

  const filteredFields = names
    .map((label) => customFieldsData.find((field) => field.name === label))
    .filter(Boolean);

  return (
    <Box>
      {loading ? (
        <Loader showBackdrop={true} loadingText={t('COMMON.LOADING')} />
      ) : (
        <LearnerModal
          userId={userData?.userId}
          open={isModalOpenLearner}
          onClose={handleCloseModalLearner}
          data={filteredFields}
          userName={userName}
        />
      )}

      <Box sx={boxStyling}>
        <Typography
          variant="body1"
          marginRight="auto"
          marginY="auto"
          sx={{
            textAlign: 'left',
            fontSize: '14px',
            fontWeight: '400',
            color: '#1F1B13',
          }}
          onClick={() => handleOpenModalLearner(userData?.userId!)}
        >
          {isBulkAction ? (
            t('ATTENDANCE.MARK_ALL')
          ) : showLink ? (
            <Link style={{ color: theme.palette.secondary.main }} href={''}>
              {userData?.name}
            </Link>
          ) : (
            userData?.name
          )}
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          className="icon_holder"
          p={1}
          onClick={() =>
            handleClickAction(
              isBulkAction,
              ATTENDANCE_ENUM.PRESENT,
              isBulkAction ? '' : userData?.userId
            )
          }
        >
          {[userData?.attendance, bulkAttendanceStatus].includes(
            ATTENDANCE_ENUM.PRESENT
          ) ? (
            <CheckCircleIcon
              style={{
                fill: isDisabled
                  ? theme.palette.success.main
                  : theme.palette.success.main,
              }}
            />
          ) : (
            <CheckCircleOutlineIcon
              style={{
                fill: isDisabled
                  ? theme.palette.warning['400']
                  : theme.palette.warning[100],
              }}
            />
          )}
          <Typography
            variant="h6"
            marginTop={1}
            sx={{ color: () => theme.palette.warning[400] }}
          >
            {t('ATTENDANCE.PRESENT')}
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          className="icon_holder"
          p={1}
          onClick={() =>
            handleClickAction(
              isBulkAction,
              ATTENDANCE_ENUM.ABSENT,
              isBulkAction ? '' : userData?.userId
            )
          }
        >
          {[userData?.attendance, bulkAttendanceStatus].includes(
            ATTENDANCE_ENUM.ABSENT
          ) ? (
            <CancelIcon style={{ fill: theme.palette.error.main }} />
          ) : (
            <HighlightOffIcon
              style={{
                fill: isDisabled
                  ? theme.palette.warning['400']
                  : theme.palette.warning[100],
              }}
            />
          )}
          <Typography
            variant="h6"
            marginTop={1}
            sx={{ color: () => theme.palette.warning[400] }}
          >
            {t('ATTENDANCE.ABSENT')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceStatusListView;
