import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PasswordCreate from '@/components/PasswordCreate';
import { showToastMessage } from '@/components/Toastify';
import { useRouter } from 'next/router';
import { forgotPasswordAPI } from '@/services/LoginService';
import CentralizedModal from '@/components/CentralizedModal';

const ResetPassword = () => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();
  const [forgotPassword, setForgotPassword] = useState<boolean>(false);

  const { token } = router.query;

  const handleResetPassword = async (newPassword: string) => {
    if (!token) {
      showToastMessage('Invalid or missing token', 'error');
      return;
    }

    try {
      const response = await forgotPasswordAPI(newPassword, token as string);
      console.log(response);
      setForgotPassword(true);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setForgotPassword(false);
      showToastMessage(error.response.data.params.err, 'error');
    }
  };

  const handlePrimaryButton = () => {
    router.push(`/login`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        px: '16px',
        alignItems: 'center',
        '@media (min-width: 700px)': {
          height: '100vh',
        },
      }}
    >
      <Box
        sx={{
          '@media (min-width: 700px)': {
            width: '50%',
            boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
            padding: '60px',
            marginTop: '0rem',
          },
          width: '100%',
          marginTop: '8rem',
        }}
      >
        <Box
          sx={{
            color: theme.palette.warning['300'],
            fontWeight: '400',
            fontSize: '22px',
            textAlign: 'center',
          }}
        >
          {t('LOGIN_PAGE.CREATE_STRONG_PASSWORD')}
        </Box>
        <Box
          sx={{
            color: theme.palette.warning['300'],
            fontWeight: '400',
            fontSize: '14px',
            textAlign: 'center',
            mt: 0.5,
          }}
        >
          {t('LOGIN_PAGE.CREATE_NEW')}
        </Box>
        <PasswordCreate handleResetPassword={handleResetPassword} />
        <CentralizedModal
          icon={true}
          subTitle={t('LOGIN_PAGE.SUCCESSFULLY_RESET')}
          primary={t('COMMON.OKAY')}
          modalOpen={forgotPassword}
          handlePrimaryButton={handlePrimaryButton}
        />
      </Box>
    </Box>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default ResetPassword;