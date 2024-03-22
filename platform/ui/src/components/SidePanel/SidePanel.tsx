import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  ButtonEnums,
  Button,
} from '@ohif/ui';
import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { assignToMe, getScanTest } from '../../../../../custom/utils/utils';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

type StyleMap = {
  open: {
    left: { marginLeft: string };
    right: { marginRight: string };
  };
  closed: {
    left: { marginLeft: string };
    right: { marginRight: string };
  };
};
const borderSize = 4;
const collapsedWidth = 25;
const closeIconWidth = 30;
const gridHorizontalPadding = 10;
const tabSpacerWidth = 2;

const baseClasses =
  'transition-all duration-300 ease-in-out bg-black border-black justify-start box-content flex flex-col';

const classesMap = {
  open: {
    left: `mr-1`,
    right: `ml-1`,
  },
  closed: {
    left: `mr-2 items-end`,
    right: `ml-2 items-start`,
  },
};

const openStateIconName = {
  left: 'side-panel-close-left',
  right: 'side-panel-close-right',
};

const getTabWidth = (numTabs: number) => {
  if (numTabs < 3) {
    return 68;
  } else {
    return 40;
  }
};

const getGridWidth = (numTabs: number, gridAvailableWidth: number) => {
  const spacersWidth = (numTabs - 1) * tabSpacerWidth;
  const tabsWidth = getTabWidth(numTabs) * numTabs;

  if (gridAvailableWidth > tabsWidth + spacersWidth) {
    return tabsWidth + spacersWidth;
  }

  return gridAvailableWidth;
};

const getNumGridColumns = (numTabs: number, gridWidth: number) => {
  if (numTabs === 1) {
    return 1;
  }

  // Start by calculating the number of tabs assuming each tab was accompanied by a spacer.
  const tabWidth = getTabWidth(numTabs);
  const numTabsWithOneSpacerEach = Math.floor(gridWidth / (tabWidth + tabSpacerWidth));

  // But there is always one less spacer than tabs, so now check if an extra tab with one less spacer fits.
  if (
    (numTabsWithOneSpacerEach + 1) * tabWidth + numTabsWithOneSpacerEach * tabSpacerWidth <=
    gridWidth
  ) {
    return numTabsWithOneSpacerEach + 1;
  }

  return numTabsWithOneSpacerEach;
};

const getGridStyle = (
  side: string,
  numTabs: number = 0,
  gridWidth: number,
  expandedWidth: number
): CSSProperties => {
  const relativePosition = Math.max(0, Math.floor(expandedWidth - gridWidth) / 2 - closeIconWidth);
  return {
    position: 'relative',
    ...(side === 'left' ? { right: `${relativePosition}px` } : { left: `${relativePosition}px` }),
    width: `${gridWidth}px`,
  };
};

const getTabClassNames = (
  numColumns: number,
  numTabs: number,
  tabIndex: number,
  isActiveTab: boolean
) =>
  classnames('h-[28px] mb-[2px] cursor-pointer text-white bg-black', {
    'hover:text-primary-active': !isActiveTab,
    'rounded-l': tabIndex % numColumns === 0,
    'rounded-r': (tabIndex + 1) % numColumns === 0 || tabIndex === numTabs - 1,
  });

const getTabStyle = (numTabs: number) => {
  return {
    width: `${getTabWidth(numTabs)}px`,
  };
};

const getTabIconClassNames = (numTabs: number, isActiveTab: boolean) => {
  return classnames('h-full w-full flex items-center justify-center', {
    'bg-customblue-40': isActiveTab,
    rounded: isActiveTab,
  });
};
const createStyleMap = (
  expandedWidth: number,
  borderSize: number,
  collapsedWidth: number
): StyleMap => {
  const collapsedHideWidth = expandedWidth - collapsedWidth - borderSize;

  return {
    open: {
      left: { marginLeft: '0px' },
      right: { marginRight: '0px' },
    },
    closed: {
      left: { marginLeft: `-${collapsedHideWidth}px` },
      right: { marginRight: `-${collapsedHideWidth}px` },
    },
  };
};

const createBaseStyle = (expandedWidth: number) => {
  return {
    maxWidth: `${expandedWidth}px`,
    width: `${expandedWidth}px`,
    // To align the top of the side panel with the top of the viewport grid, use position relative and offset the
    // top by the same top offset as the viewport grid. Also adjust the height so that there is no overflow.
    position: 'relative',
    top: '0.2%',
    height: '99.8%',
  };
};
const SidePanel = ({
  side,
  className,
  activeTabIndex: activeTabIndexProp,
  tabs,
  onOpen,
  expandedWidth = 308,
}) => {
  const { t } = useTranslation('SidePanel');

  const [panelOpen, setPanelOpen] = useState(activeTabIndexProp !== null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const styleMap = createStyleMap(expandedWidth, borderSize, collapsedWidth);
  const baseStyle = createBaseStyle(expandedWidth);
  const gridAvailableWidth = expandedWidth - closeIconWidth - gridHorizontalPadding;
  const gridWidth = getGridWidth(tabs.length, gridAvailableWidth);
  const openStatus = panelOpen ? 'open' : 'closed';
  const style = Object.assign({}, styleMap[openStatus][side], baseStyle);

  const ActiveComponent = tabs[activeTabIndex]?.content;

  const updatePanelOpen = useCallback((panelOpen: boolean) => {
    setPanelOpen(panelOpen);
    if (panelOpen) {
      onOpen?.();
    }
  }, []);

  const updateActiveTabIndex = useCallback(
    (activeTabIndex: number) => {
      if (activeTabIndex === null) {
        updatePanelOpen(false);
        return;
      }

      setActiveTabIndex(activeTabIndex);
      updatePanelOpen(true);
    },
    [updatePanelOpen]
  );

  useEffect(() => {
    updateActiveTabIndex(activeTabIndexProp);
  }, [activeTabIndexProp, updateActiveTabIndex]);

  const getCloseStateComponent = () => {
    const _childComponents = Array.isArray(tabs) ? tabs : [tabs];
    return (
      <>
        <div
          className={classnames(
            'bg-secondary-dark flex h-[28px] w-full cursor-pointer items-center rounded-md',
            side === 'left' ? 'justify-end pr-2' : 'justify-start pl-2'
          )}
          onClick={() => {
            updatePanelOpen(prev => !prev);
          }}
          data-cy={`side-panel-header-${side}`}
        >
          <Icon
            name={'navigation-panel-right-reveal'}
            className={classnames('text-primary-active', side === 'left' && 'rotate-180 transform')}
          />
        </div>
        <div className={classnames('mt-3 flex flex-col space-y-3')}>
          {_childComponents.map((childComponent, index) => (
            <Tooltip
              position={side === 'left' ? 'right' : 'left'}
              key={index}
              content={`${childComponent.label}`}
              className={classnames(
                'flex items-center',
                side === 'left' ? 'justify-end ' : 'justify-start '
              )}
            >
              <div
                id={`${childComponent.name}-btn`}
                data-cy={`${childComponent.name}-btn`}
                className="text-primary-active hover:cursor-pointer"
                onClick={() => {
                  updateActiveTabIndex(index);
                }}
              >
                <Icon
                  name={childComponent.iconName}
                  className="text-primary-active"
                  style={{
                    width: '22px',
                    height: '22px',
                  }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </>
    );
  };

  const getCloseIcon = () => {
    return (
      <div
        className={classnames(
          'flex h-[28px] cursor-pointer items-center justify-center',
          side === 'left' ? 'order-last' : 'order-first'
        )}
        style={{ width: `${closeIconWidth}px` }}
        onClick={() => {
          updatePanelOpen(prev => !prev);
        }}
        data-cy={`side-panel-header-${side}`}
      >
        <Icon
          name={openStateIconName[side]}
          className="text-primary-active"
        />
      </div>
    );
  };

  const getTabGridComponent = () => {
    const numCols = getNumGridColumns(tabs.length, gridWidth);

    return (
      <div className={classnames('flex grow ', side === 'right' ? 'justify-start' : 'justify-end')}>
        <div
          className={classnames('bg-primary-dark text-primary-active flex flex-wrap')}
          style={getGridStyle(side, tabs.length, gridWidth, expandedWidth)}
        >
          {tabs.map((tab, tabIndex) => {
            return (
              <React.Fragment key={tabIndex}>
                {tabIndex % numCols !== 0 && (
                  <div
                    className={classnames(
                      'flex h-[28px] w-[2px] items-center bg-black',
                      tabSpacerWidth
                    )}
                  >
                    <div className="bg-primary-dark h-[20px] w-full"></div>
                  </div>
                )}
                <Tooltip
                  position={'bottom'}
                  key={tabIndex}
                  content={`${tab.label}`}
                >
                  <div
                    className={getTabClassNames(
                      numCols,
                      tabs.length,
                      tabIndex,
                      tabIndex === activeTabIndex
                    )}
                    style={getTabStyle(tabs.length)}
                    onClick={() => updateActiveTabIndex(tabIndex)}
                    data-cy={`${tab.name}-btn`}
                  >
                    <div className={getTabIconClassNames(tabs.length, tabIndex === activeTabIndex)}>
                      <Icon
                        name={tab.iconName}
                        style={{
                          width: '22px',
                          height: '22px',
                        }}
                      ></Icon>
                    </div>
                  </div>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const getOneTabComponent = () => {
    return (
      <div
        className={classnames(
          'text-primary-active flex grow cursor-pointer justify-center self-center text-[13px]'
        )}
        style={{
          ...(side === 'left'
            ? { marginLeft: `${closeIconWidth}px` }
            : { marginRight: `${closeIconWidth}px` }),
        }}
        data-cy={`${tabs[0].name}-btn`}
        onClick={() => updatePanelOpen(prev => !prev)}
      >
        <span>{tabs[0].label}</span>
      </div>
    );
  };

  const getOpenStateComponent = () => {
    return (
      <div className="bg-primary-dark flex flex-col rounded-t pt-1.5 pb-[2px]">
        {getCloseIcon()}
        {
          tabs.length !== 1 && <UserInfo />
        }

        <div style={{ background: '#040614' }}>
          {tabs.length === 1 ? getOneTabComponent() : getTabGridComponent()}
        </div>
      </div>
    );
  };

  return (
    <div
      className={classnames(className, baseClasses, classesMap[openStatus][side])}
      style={style}
    >
      {panelOpen ? (
        <>
          {getOpenStateComponent()}
          <ActiveComponent />
        </>
      ) : (
        <React.Fragment>{getCloseStateComponent()}</React.Fragment>
      )}
    </div>
  );
};

const UserInfo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfoVisible, setUserInfoVisible] = useState(true); // State variable to control UserInfo visibility
  const query = new URLSearchParams(window.location.search);

  useEffect(() => {
    getInfo()
      .then((response) => {
        setData(response);
      })
      .catch((error) => {
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getInfo = async () => {
    try {
      const response = await getScanTest(query.get('id'), localStorage.getItem('token'));
      return response.data[0];
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const handleViewPrescription = (prescription) => {
    console.log(prescription, 'prescription file');
    window.parent.postMessage({ type: 'prescription', data: prescription }, '*');
  };

  const toggleUserInfoVisibility = () => {
    setUserInfoVisible((prevVisible) => !prevVisible); // Toggle the visibility state
  };

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="info-container">
          <div className="info-heading px-2 pt-1 flex justify-between items-center text-base font-bold uppercase tracking-widest text-white"
            style={{
              backgroundColor: 'rgb(43 22 107 / var(--tw-bg-opacity))',
            }}>
            <span>User-Info</span>
            {
              userInfoVisible ?
                <Icon
                  name='ui-arrow-down'
                  style={{
                    width: '12px',
                    height: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    toggleUserInfoVisibility();
                  }}
                ></Icon>
                :
                <Icon
                  name='ui-arrow-up'
                  style={{
                    width: '12px',
                    height: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    toggleUserInfoVisibility();
                  }}
                ></Icon>
            }
          </div>
          {userInfoVisible && data && (
            <div className='text-base px-2 py-4 tracking-widest text-white'>
              <p><span className="uppercase font-bold">Name:</span> {data.patient.firstName} {data.patient.lastName}</p>
              <p><span className="uppercase font-bold">Scan Time:</span> {new Date(data.report[0].scanTime).toLocaleString()}</p>
              <p><span className="uppercase font-bold">PATIENT ID:</span> {data.refNumber}</p>
              <p><span className="uppercase font-bold">Scan Test:</span> {data.testName}</p>

              <p className='pt-1'>
                <span className="uppercase font-bold">Prescription: </span>
                {data.prescription ?
                  <Button
                    onClick={() => handleViewPrescription(data.prescription)}
                    name='View'
                    type={ButtonEnums.type.secondary}
                    size={ButtonEnums.size.small}
                  >
                    {('View')}
                  </Button>
                  :
                  'No prescription available'

                }
              </p>

            </div>
          )}
          {!data && <div>Error: Unable to fetch data</div>}
        </div>
      )}
      <ReviewerInfo data={data} loading={loading} id={query.get('id')} />
    </>
  );
};

const ReviewerInfo = ({ data, loading, id }) => {

  const [reviewerInfoVisible, setReviewerInfoVisible] = useState(true);
  const [assignData, setAssignData] = useState(null);
  const [loadingData, setLoading] = useState(true);

  const assignToMeApi = async (id: string) => {
    try {
      const response = await assignToMe(id, localStorage.getItem('token'));
      return response.data[0];
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., display an error message)
      return null; // Return null to indicate error
    }
  };

  const toggleReviewerInfoVisibility = () => {
    setReviewerInfoVisible((prevVisible) => !prevVisible); // Toggle the visibility state
  };

  const getInfo = async () => {
    try {
      const response = await getScanTest(id, localStorage.getItem('token'));
      return response.data[0];
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., display an error message)
      return null; // Return null to indicate error
    }
  };

  const handleAddReviewer = (ReportId: any) => {
    // Assuming path is the target origin for security reasons
    console.log(ReportId, 'ReportId file');
    window.parent.postMessage({ type: 'ReportId', data: ReportId }, '*');
  };

  window.addEventListener('message', function (event) {

    if (event.origin === 'http://localhost:3001') { // Replace with the actual origin of the parent window
      // Handle the received data
      if (event.data === 'success') {
        getInfo()
          .then((response1) => {
            setAssignData(response1);
          })
          .catch((error) => {
            setAssignData(null); // Set data to null in case of error
          })
      }
      console.log('Received message in iframe:', event.data);
    }
  });

  const handleAssign = (reportId: string) => {
    // Assuming path is the target origin for security reasons
    console.log(reportId, 'prescription file');
    assignToMeApi(reportId)
      .then((response) => {
        if (response) {
          getInfo()
            .then((response1) => {
              setAssignData(response1);
            })
            .catch((error) => {
              window.parent.postMessage({ type: 'Error', data: 'Error in Picking the Report' }, '*');
              // Set data to null in case of error
            })
            .finally(() => {
              setLoading(false); // Set loading to false regardless of success or error
            });
        }
        else {

          window.parent.postMessage({ type: 'Error', data: 'Error in Picking the Report' }, '*');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })


  };

  return (
    <>
      {loading ? (
        <div>Loading...</div> // Show a loading indicator while fetching data
      ) : (
        <div className="info-container py-2">
          <div className="info-heading px-2 pt-1 flex justify-between items-center text-base font-bold uppercase tracking-widest text-white"
            style={{
              backgroundColor: 'rgb(43 22 107 / var(--tw-bg-opacity))',
            }}>
            Reviewer-Info
            <Icon
              name={reviewerInfoVisible ? 'ui-arrow-down' : 'ui-arrow-up'}
              style={{
                width: '12px',
                height: '12px',
                cursor: 'pointer',
              }}
              onClick={toggleReviewerInfoVisibility}
            ></Icon>
          </div>

          {reviewerInfoVisible && (
            <>
              {data.report[0].pickedBy.length > 0 || !loadingData ? (
                <>
                  {
                    data.report[0].currentReviewer.length > 0 && (
                      <div className='text-base px-2 pt-4 pb-2 tracking-widest text-white' style={{ borderBottom: '1px solid rgb(4, 28, 74)' }}>
                        <p><span className="uppercase font-bold" style={{ fontSize: '14px', color: '#f7ff00' }}>
                          Current Reveiwer:</span></p>
                        <p><span className="uppercase font-bold">Name:</span>
                          {assignData ? assignData.report[0].currentReviewer[0].firstName + ' ' + assignData.report[0].currentReviewer[0].lastName
                            : data.report[0].currentReviewer[0].firstName + ' ' + data.report[0].currentReviewer[0].lastName}
                        </p>
                        {/* <p><span className="uppercase font-bold">Review Time:</span>
                          {assignData ? new Date(assignData.report[0].pickedAt).toLocaleString()
                            : new Date(data.report[0].pickedAt).toLocaleString()}
                        </p>
                        {(data.report[0].pickedAt || assignData) && (
                          <p className='py-1'>
                            <span className="uppercase font-bold">Ask Reviewer: </span>
                            <Button
                              onClick={() => handleAddReviewer(assignData ? assignData.report[0]._id : data.report[0]._id)}
                              name='View'
                              type={ButtonEnums.type.secondary}
                              size={ButtonEnums.size.small}
                            >
                              {('Ask')}
                            </Button>
                          </p>
                        )} */}

                      </div>
                    )
                  }
                  <div className='text-base px-2 pt-4 pb-2 tracking-widest text-white'>
                    <p><span className="uppercase font-bold" style={{ fontSize: '14px', color: '#f7ff00' }}>
                      PickedBy:</span></p>
                    <p><span className="uppercase font-bold">Name:</span>
                      {assignData ? assignData.report[0].currentReviewer[0].firstName + ' ' + assignData.report[0].pickedBy[0].lastName
                        : data.report[0].pickedBy[0].firstName + ' ' + data.report[0].pickedBy[0].lastName}
                    </p>
                    <p><span className="uppercase font-bold">Review Time:</span>
                      {assignData ? new Date(assignData.report[0].pickedAt).toLocaleString()
                        : new Date(data.report[0].pickedAt).toLocaleString()}
                    </p>
                    {(data.report[0].pickedAt || assignData) && (
                      <p className='py-1'>
                        <span className="uppercase font-bold">Ask Reviewer: </span>
                        <Button
                          onClick={() => handleAddReviewer(assignData ? assignData.report[0]._id : data.report[0]._id)}
                          name='View'
                          type={ButtonEnums.type.secondary}
                          size={ButtonEnums.size.small}
                        >
                          {('Ask')}
                        </Button>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="noReviewer py-2">
                  <div className="text-base tracking-widest text-white">No Reviewer</div>
                  <div className="assign py-2 flex justify-center">
                    <Button
                      onClick={() => handleAssign(data.report[0]._id)}
                      name='Assign to me'
                      type={ButtonEnums.type.secondary}
                      size={ButtonEnums.size.small}
                    >
                      {('Assign to me')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          {!data && <div>Error: Unable to fetch data</div>} {/* Display error message if data is null */}
        </div>
      )}
    </>

  );
};

SidePanel.defaultProps = {
  defaultComponentOpen: null,
  activeTabIndex: null, // the default is to close the side panel
};

SidePanel.propTypes = {
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  className: PropTypes.string,
  activeTabIndex: PropTypes.number,
  tabs: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        iconName: PropTypes.string.isRequired,
        iconLabel: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        content: PropTypes.func, // TODO: Should be node, but it keeps complaining?
      })
    ),
  ]),
  onOpen: PropTypes.func,
  expandedWidth: PropTypes.number,
};

export default SidePanel;
