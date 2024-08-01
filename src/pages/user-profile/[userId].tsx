import { Box, Grid, Typography, useMediaQuery } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  East as EastIcon,
} from '@mui/icons-material';
import { CustomField } from '@/utils/Interfaces';
import React, { useEffect, useRef, useState } from 'react';
import { getUserDetails } from '@/services/ProfileService';
import { useTheme } from '@mui/material/styles';
import { GetStaticPaths } from 'next';
import Button from '@mui/material/Button';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import Header from '@/components/Header';
import Image from 'next/image';
import Loader from '@/components/Loader';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReactGA from 'react-ga4';
import { accessControl } from '../../../app.config';
import { toPascalCase, mapFieldIdToValue } from '@/utils/Helper';
import { logEvent } from '@/utils/googleAnalytics';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { showToastMessage } from '@/components/Toastify';
import { useProfileInfo } from '@/services/queries';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import user_placeholder from '../../assets/images/user_placeholder.png';
import withAccessControl from '@/utils/hoc/withAccessControl';
import { getFormRead } from '@/services/CreateUserService';
import { FormContext, FormContextType, Role } from '@/utils/app.constant';
import manageUserStore from '@/store/manageUserStore';
import useStore from '@/store/store';
import AddFacilitatorModal from '@/components/AddFacilitator';

interface UserData {
  name: string;
}

const TeacherProfile = () => {
  const user_placeholder_img: string = user_placeholder.src;

  const { t } = useTranslation();
  const router = useRouter();
  const { userId }: any = router.query;
  const store = useStore();
  const userRole = store.userRole;
  const userStore = manageUserStore();
  const selfUserId = localStorage.getItem('userId');
  const theme = useTheme<any>();

  const [userData, setUserData] = useState<any | null>(null);
  const [userName, setUserName] = useState<any | null>(null);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [customFieldsData, setCustomFieldsData] = useState<CustomField[]>([]);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(user_placeholder_img);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [unitName, setUnitName] = useState('');
  const [blockName, setBlockName] = useState('');
  const [isError, setIsError] = React.useState<boolean>(false);
  const [isData, setIsData] = React.useState<boolean>(false);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [openAddLearnerModal, setOpenAddLearnerModal] = React.useState(false);

  const handleOpenAddLearnerModal = () => {
    setOpenAddLearnerModal(true);
    logEvent({
      action: 'edit-teacher-profile-modal-open',
      category: 'Profile Page',
      label: 'Edit Teacher Profile Modal Open',
    });
  };

  const handleCloseAddLearnerModal = () => {
    setOpenAddLearnerModal(false);
    logEvent({
      action: 'edit-teacher-profile-modal-close',
      category: 'Profile Page',
      label: 'Edit Teacher Profile Modal Close',
    });
  };

  const mapFields = (formFields: any, response: any) => {
    let initialFormData: any = {};
    formFields.fields.forEach((item: any) => {
      const userData = response?.userData;
      const customField = userData?.customFields?.find(
        (field: any) => field.fieldId === item.fieldId
      );
      const getValue = (data: any, field: any) => {
        if (item.default) {
          return item.default;
        }
        if (item?.isMultiSelect) {
          if (data[item.name] && item?.maxSelections > 1) {
            return [field.value];
          } else if (item?.type === 'checkbox') {
            return String(field.value).split(',');
          } else {
            return field.value;
          }
        } else {
          if (item?.type === 'numeric') {
            return Number(field.value);
          } else if (item?.type === 'text') {
            return String(field.value);
          } else {
            return field.value;
          }
        }
      };
      if (item.coreField) {
        if (item?.isMultiSelect) {
          if (userData[item.name] && item?.maxSelections > 1) {
            initialFormData[item.name] = [userData[item.name]];
          } else {
            initialFormData[item.name] = userData[item.name] || '';
          }
        } else if (item?.type === 'numeric') {
          initialFormData[item.name] = Number(userData[item.name]);
        } else if (item?.type === 'text') {
          initialFormData[item.name] = String(userData[item.name]);
        } else {
          initialFormData[item.name] = userData[item.name];
        }
      } else {
        initialFormData[item.name] = getValue(userData, customField);
      }
    });
    console.log('initialFormData', initialFormData);
    return initialFormData;
  };

  const fetchDataAndInitializeForm = async () => {
    try {
      let formFields;
      const response = await getUserDetails(userId, true);
      formFields = await getFormRead('USERS', 'TEACHER'); //TODO: Change for TL
      console.log('response', response);
      console.log('formFields', formFields);
      setFormData(mapFields(formFields, response?.result));
    } catch (error) {
      console.error('Error fetching data or initializing form:', error);
    }
  };

  useEffect(() => {
    fetchDataAndInitializeForm();
  }, [userId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
    }
  }, []);

  // find Address
  const getFieldValue = (data: any, label: string) => {
    const field = data.find((item: any) => item.label === label);
    return field ? field.value[0] : null;
  };

  const { data, error, isLoading } = useProfileInfo(userId ?? '', true);

  useEffect(() => {
    setLoading(isLoading);

    if (error) {
      setIsError(true);
      showToastMessage(t('COMMON.SOMETHING_WENT_WRONG'), 'error');
      console.error('Error fetching user details:', error);
    } else {
      setIsError(false);
    }

    if (data) {
      const coreFieldData = data?.result?.userData;
      setUserName(toPascalCase(coreFieldData?.name));
      const fields: CustomField[] = data?.result?.userData?.customFields;
      const fieldIdToValueMap: { [key: string]: string } =
        mapFieldIdToValue(fields);
      console.log(`coreFieldData`, coreFieldData);

      const fetchFormData = async () => {
        try {
          const formContextType =
            (userRole === Role.TEAM_LEADER && selfUserId === userId)
              ? FormContextType.TEAM_LEADER
              : FormContextType.TEACHER;
          const response: FormData = await getFormRead(
            FormContext.USERS,
            formContextType
          );
          console.log('response', response);
          if (response) {
            const mergeData = (
              fieldIdToValueMap: { [key: string]: string },
              response: any
            ): any => {
              response.fields.forEach(
                (field: {
                  name: any;
                  fieldId: string | number;
                  value: string;
                  coreField: number;
                }) => {
                  if (field.fieldId && fieldIdToValueMap[field.fieldId]) {
                    // Update field value from fieldIdToValueMap if fieldId is available
                    field.value = fieldIdToValueMap[field.fieldId] || '-';
                  } else if (field.coreField === 1) {
                    // Set field value from fieldIdToValueMap if coreField is 1 and fieldId is not in the map
                    field.value = coreFieldData[field.name] || '-';
                  }
                }
              );
              return response;
            };

            const mergedProfileData = mergeData(fieldIdToValueMap, response);
            console.log(`mergedProfileData`, mergedProfileData);
            if (mergedProfileData) {
              setUserData(mergedProfileData?.fields);
              const nameField = mergedProfileData.fields.find(
                (field: { name: string }) => field.name === 'name'
              );
              const customDataFields = mergedProfileData?.fields;
              setIsData(true);

              if (customDataFields?.length > 0) {
                setCustomFieldsData(customDataFields);

                const unitName = getFieldValue(customDataFields, 'Unit Name');
                setUnitName(unitName);
                const blockName = getFieldValue(customDataFields, 'Block Name');
                setBlockName(blockName);
              }
            }
          } else {
            setIsData(false);
            console.log('No data Found');
          }
        } catch (error) {
          console.error('Error fetching form data:', error);
        }
      };
      fetchFormData();
    }
  }, [data, error, isLoading]);

  // Find fields for "Subjects I Teach" and "My Main Subjects"
  const teachSubjectsField = customFieldsData?.find(
    (field) => field.name === 'subject_taught'
  );
  const mainSubjectsField: any = customFieldsData?.find(
    (field) => field.name === 'main_subject'
  );

  const teachSubjects: string[] = teachSubjectsField
    ? teachSubjectsField?.value?.split(',')
    : [];
  const mainSubjects: string[] = mainSubjectsField
    ? mainSubjectsField?.value?.split(',')
    : [];

  // Find mutual and remaining subjects
  const mutualSubjects = teachSubjects?.filter((subject) =>
    mainSubjects?.includes(subject)
  );
  const remainingSubjects = teachSubjects?.filter(
    (subject) => !mainSubjects?.includes(subject)
  );
  const orderedSubjects = [...mutualSubjects, ...remainingSubjects];

  // Function to get label for a subject from the options array
  const getLabelForSubject = (subject: string) => {
    const option = teachSubjectsField?.options?.find(
      (opt: any) => opt.value === subject
    );
    return option ? option.label : subject;
  };

  //fields  for view profile by order
  const filteredSortedForView = [...customFieldsData]
    ?.filter((field) => field.order !== 0 && field.name !== 'main_subject')
    ?.sort((a, b) => a.order - b.order);

  // fields for showing in  basic details
  const getLabelForValue = (field: any, value: string) => {
    if (
      field.type === 'radio' ||
      field.type === 'Radio' ||
      field.type === 'drop_down' ||
      field.type === 'dropdown'
    ) {
      const option = field?.options?.find((opt: any) => opt?.value === value);
      return option ? option?.label : value;
    }
    return value;
  };

  // address find
  const address = [unitName, blockName, userData?.district, userData?.state]
    ?.filter(Boolean)
    ?.join(', ');

  // //------------edit teacher profile------------
  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        minWidth={'100%'}
      >
        <Header />
        {loading && (
          <Loader showBackdrop={true} loadingText={t('COMMON.LOADING')} />
        )}
        {isData && isData ? (
          <Box
            display="flex"
            flexDirection="column"
            // padding={2}
            justifyContent={'center'}
            alignItems={'center'}
          >
            {selfUserId === userId ? (
              <Box
                sx={{ flex: '1', minWidth: '100%' }}
                display="flex"
                flexDirection="row"
                gap="5px"
                padding="25px 19px  20px"
              >
                <Typography
                  // variant="h3"
                  style={{
                    letterSpacing: '0.1px',
                    textAlign: 'left',
                    marginBottom: '2px',
                  }}
                  fontSize={'22px'}
                  fontWeight={'400'}
                  lineHeight={'28px'}
                  color={theme.palette.warning['A200']}
                >
                  {t('PROFILE.MY_PROFILE')}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{ flex: '1', minWidth: '100%' }}
                display="flex"
                flexDirection="row"
                gap="10px"
                padding="25px 19px  20px"
              >
                <Box display={'flex'}>
                  <Box
                    onClick={() => {
                      window.history.back();
                      logEvent({
                        action: 'back-button-clicked-teacher-profile-page',
                        category: 'Teacher Profile Page',
                        label: 'Back Button Clicked',
                      });
                    }}
                  >
                    <ArrowBackIcon
                      sx={{
                        color: (theme.palette.warning as any)['A200'],
                        height: '1.5rem',
                        width: '1.5rem',
                        cursor: 'pointer',
                        pr: '5px',
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      style={{
                        letterSpacing: '0.1px',
                        textAlign: 'left',
                        marginBottom: '2px',
                      }}
                      fontSize={'1.375rem'}
                      fontWeight={'400'}
                      lineHeight={'1.75rem'}
                      color={theme.palette.warning['A200']}
                    >
                      {userName}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: theme.typography.fontFamily,
                        fontSize: '12px',
                      }}
                    >
                      {address}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Box padding="5px 19px" className="w-100">
              <Box
                sx={{
                  flex: '1',
                  border: '1px solid #D0C5B4',
                  boxShadow: '0px 1px 2px 0px #0000004D',

                  borderColor: theme.palette.warning['A100'],
                }}
                minWidth={'100%'}
                borderRadius={'12px'}
                border={'1px'}
                bgcolor={theme.palette.warning.A400}
                display="flex"
                gap={'25px'}
                alignItems={'center'}
              >
                <Image
                  src={user_placeholder_img}
                  alt="user"
                  width={116}
                  height={120}
                  style={{
                    borderTopLeftRadius: '12px',
                    borderBottomLeftRadius: '12px',
                  }}
                />
                <Box width={'100%'}>
                  <Box>
                    <Box
                      fontSize={'16px'}
                      lineHeight={'16px'}
                      className="text-dark-grey"
                      width={'100%'}
                      fontWeight={'500'}
                    >
                      <Typography
                        sx={{ wordBreak: 'break-word' }}
                        className="text-dark-grey two-line-text"
                        mr={'40px'}
                      >
                        {toPascalCase(
                          userData?.find(
                            (field: { name: string }) => field.name === 'name'
                          )?.value
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display={'flex'} gap={'4px'} mt={'5px'}>
                    {address ? (
                      <PlaceOutlinedIcon
                        sx={{
                          fontSize: '1rem',
                          marginTop: '1px',
                          fontWeight: '11.7px',
                          height: '14.4px',
                        }}
                      />
                    ) : (
                      ''
                    )}

                    <Typography
                      margin={0}
                      color={theme.palette.warning.A200}
                      fontSize={'12px'}
                      fontWeight={'500'}
                      lineHeight={'16px'}
                      className="text-dark-grey"
                    >
                      {address}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              className="linerGradient"
              sx={{
                padding: '10px 16px 21px',
                width: '100%',
                mt: 3,
                // '@media (min-width: 900px)': {
                //   borderRadius: '8px',
                //   display: 'flex',
                //   gap: '15px',
                //   alignItems: 'center',
                //   flexDirection: 'row-reverse',
                // },
              }}
            >
              {userRole == Role.TEAM_LEADER && userId !== selfUserId ? (
                <Button
                  className="min-width-md-20"
                  sx={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    minWidth: '100%',
                    padding: '10px 24px 10px 16px',
                    gap: '8px',
                    borderRadius: '100px',
                    marginTop: '10px',
                    flex: '1',
                    textAlign: 'center',
                    color: theme.palette.warning.A200,
                    border: `1px solid #4D4639`,
                  }}
                  onClick={handleOpenAddLearnerModal}
                >
                  <Typography
                    variant="h3"
                    style={{
                      letterSpacing: '0.1px',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                    fontSize={'14px'}
                    fontWeight={'500'}
                    lineHeight={'20px'}
                  >
                    {t('PROFILE.EDIT_PROFILE')}
                  </Typography>
                  <Box>
                    <CreateOutlinedIcon sx={{ fontSize: '18px' }} />
                  </Box>
                </Button>
              ) : null}
              {openAddLearnerModal && (
                <div>
                  <AddFacilitatorModal
                    open={openAddLearnerModal}
                    onClose={handleCloseAddLearnerModal}
                    formData={formData}
                    isEditModal={true}
                    userId={userId}
                  />
                </div>
              )}
              <Box
                mt={2}
                sx={{
                  flex: '1',
                  // textAlign: 'center',
                  border: '1px solid',
                  borderColor: theme.palette.warning['A100'],
                  padding: '16px',
                  // '@media (min-width: 900px)': {
                  //   minWidth: '60%',
                  //   width: '60%',
                  // },
                }}
                className="bg-white"
                minWidth={'100%'}
                borderRadius={'16px'}
                border={'1px'}
                display="flex"
                flexDirection="row"
              >
                <Grid container spacing={4}>
                  {filteredSortedForView?.map((item, index) => {
                    if (item.order === 5) {
                      return (
                        <Grid item xs={12}>
                          <Typography
                            fontSize={'12px'}
                            fontWeight={'600'}
                            margin={0}
                            lineHeight={'16px'}
                            letterSpacing={'0.5px'}
                            sx={{ wordBreak: 'break-word' }}
                            color={theme.palette.warning['500']}
                          >
                            {item?.label && t(`FORM.${item.label}`, item.label)}
                          </Typography>
                          <Box
                            mt={2}
                            sx={{
                              display: 'flex',
                              gap: '10px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {orderedSubjects &&
                              orderedSubjects?.map((subject, index) => (
                                <Button
                                  key={index}
                                  size="small"
                                  variant={
                                    mainSubjects?.includes(subject)
                                      ? 'contained'
                                      : 'outlined'
                                  }
                                  sx={{
                                    backgroundColor: mainSubjects?.includes(
                                      subject
                                    )
                                      ? theme.palette.info.contrastText
                                      : 'none',
                                    borderRadius: '8px',
                                    color: theme.palette.warning.A200,
                                    whiteSpace: 'nowrap',
                                    boxShadow: 'none',
                                    border: `1px solid ${theme.palette.warning[900]}`,
                                    pointerEvents: 'none',
                                  }}
                                >
                                  {getLabelForSubject(subject)}
                                  {/* {subject} */}
                                </Button>
                              ))}
                          </Box>
                        </Grid>
                      );
                    } else if (item.order === 7) {
                      return (
                        <Grid item xs={12} key={index}>
                          <Typography
                            variant="h4"
                            margin={0}
                            lineHeight={'16px'}
                            fontSize={'12px'}
                            fontWeight={'600'}
                            letterSpacing={'0.5px'}
                            color={theme.palette.warning['500']}
                          >
                            {item?.label && t(`FORM.${item.label}`, item.label)}
                          </Typography>{' '}
                          {/* No of cluster */}
                          <Typography
                            variant="h4"
                            margin={0}
                            color={theme.palette.warning.A200}
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {item.value ? toPascalCase(item?.value) : '-'}
                          </Typography>
                        </Grid>
                      );
                    } else {
                      return (
                        <Grid item xs={6} key={index}>
                          {/* Profile Field Labels */}
                          <Typography
                            variant="h4"
                            margin={0}
                            lineHeight={'16px'}
                            fontSize={'12px'}
                            fontWeight={'600'}
                            letterSpacing={'0.5px'}
                            color={theme.palette.warning['500']}
                          >
                            {item?.label && t(`FORM.${item.label}`, item.label)}
                          </Typography>
                          {/* Profile Field Values */}
                          <Typography
                            variant="h4"
                            margin={0}
                            color={theme.palette.warning.A200}
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {item.value
                              ? toPascalCase(
                                  getLabelForValue(item, item?.value)
                                )
                              : '-'}{' '}
                            {/* apply elipses/ truncating here */}
                          </Typography>
                        </Grid>
                      );
                    }
                  })}
                </Grid>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box mt={5}>
            <Typography textAlign={'center'}>{t('COMMON.LOADING')}</Typography>
          </Box>
        )}{' '}
      </Box>
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  };
};

export default withAccessControl(
  'accessProfile',
  accessControl
)(TeacherProfile);
