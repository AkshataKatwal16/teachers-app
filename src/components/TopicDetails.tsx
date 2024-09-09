import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
interface TopicDetailsProps {
  topic: string;
  subTopic: [];
  learningResources: any;
  handleOpen: any;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({
  topic,
  subTopic,
  learningResources,
  handleOpen,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();

  const content: any = [];
  if (learningResources[topic]) {
    const subTopics = learningResources[topic];
    subTopic.forEach((currentSubTopic: string) => {
      if (subTopics[currentSubTopic]) {
        const resources = subTopics[currentSubTopic];
        resources.forEach((resource: any) => {
          content.push(resource);
        });
      }
    });
  }

  const openTopicModal = () => {
    handleOpen();
  };

  return (
    <>
      <Box sx={{ padding: '8px 16px' }}>
        <Box
          sx={{
            background: theme?.palette?.action?.selected,
            borderRadius: '16px',
            padding: '16px 8px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Box
                sx={{ fontSize: '12px', color: '#969088', fontWeight: '600' }}
              >
                {t('CENTER_SESSION.TOPIC')}
              </Box>
              <Box
                sx={{ fontSize: '16px', fontWeight: '400', color: '#4D4639' }}
              >
                {topic}
              </Box>
            </Box>
            <CreateOutlinedIcon
              sx={{ fontSize: '18px', color: '#0D599E', cursor: 'pointer' }}
              onClick={openTopicModal}
            />
          </Box>

          <Box
            sx={{
              fontSize: '12px',
              color: '#969088',
              fontWeight: '600',
              mt: '8px',
            }}
          >
            {t('CENTER_SESSION.SUBTOPIC')}
          </Box>
          <Box sx={{ fontSize: '16px', fontWeight: '400', color: '#4D4639' }}>
            {subTopic?.join(', ')}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: '5px',
            mt: 2,
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              fontSize: '14px',
              color: theme?.palette?.secondary.main,
              fontWeight: '500',
            }}
          >
            {t('CENTER_SESSION.REMOVE_THIS_SESSION')}
          </Box>
          <DeleteOutlineIcon
            sx={{ fontSize: '18px', color: theme?.palette?.error.main }}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Accordion
          // defaultExpanded
          sx={{
            boxShadow: 'none !important',
            border: 'none !important',
            mt: 1.5,
            background: theme?.palette?.action?.selected,
          }}
        >
          <AccordionSummary
            expandIcon={
              <ArrowDropDownIcon
                sx={{ color: theme?.palette?.warning['300'] }}
              />
            }
            aria-controls="panel1-content"
            id="panel1-header"
            className="accordion-summary"
            sx={{
              m: 0,
              background: theme?.palette?.action?.selected,
              px: '16px',
              height: '10px !important',
              '&.Mui-expanded': {
                minHeight: '48px',
              },
            }}
          >
            <Typography
              fontWeight="500"
              fontSize="14px"
              sx={{ color: theme?.palette?.warning['300'] }}
            >
              {t('CENTER_SESSION.FACILITATORS')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{ padding: '0px', background: theme?.palette?.warning['A400'] }}
          >
            <Grid container spacing={2} sx={{ px: '16px !important' }}>
              {content &&
                content.length > 0 &&
                content.map((item: any) => (
                  <Grid item xs={6} sx={{ mt: 2 }}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Box className="facilitator-bg">
                        <Box
                          sx={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: theme?.palette?.warning['A400'],
                          }}
                        >
                          {item?.name || subTopic}
                        </Box>
                        {/* <Box
                        sx={{
                          fontSize: '11px',
                          fontWeight: '500',
                          color: theme?.palette?.warning['A400'],
                        }}
                        >
                        Video
                      </Box> */}
                      </Box>
                    </a>
                  </Grid>
                ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default TopicDetails;
