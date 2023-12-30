import React, { useState, useEffect, useMemo } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
// import {useNavigate} from 'react-router-dom'

import {
  CustomItemAction,
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiText,
  EuiBasicTableColumn,
  Criteria,
  EuiHealth,
  EuiSpacer,
  EuiIcon,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCheckableCard,
  EuiTextAlign,
  EuiInMemoryTable,
  EuiToolTip,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiBadge,
  EuiLink,
  EuiCode,
  EuiToast
} from '@elastic/eui';

import { htmlIdGenerator } from "@elastic/eui/lib/services"

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';
import { agent } from 'supertest';
// import { ErrorToast } from '../../../../src/core/public/notifications/toasts/error_toast';
// import { EuiTextAlign } from '@opensearch-project/oui';

interface TestinvinsenseAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const TestinvinsenseApp = ({
  basename,
  notifications,
  http,
  navigation,
}: TestinvinsenseAppDeps) => {
  const [redirectPage, setRedirectPage] = useState(true);
  // const [timestamp, setTimestamp] = useState<string | undefined>();
  const [agentData, setAgentData] = useState<any>();
  const [isAuthorized, setIsAuthorized] = useState(true);
  // const [scanData, setScanData] = useState<any>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showPerPageOptions, setShowPerPageOptions] = useState(true);
  const [customAction, setCustomAction] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>();
  // const [availableCommands, setAvailableCommands] = useState<any>();
  const [isNonWindows, setIsNonWindows] = useState(false);
  const [authorizationModal, setAuthorizationModal] = useState(false);

  const radioName = htmlIdGenerator()();
  const [radio, setRadio] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  // const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [selection, setSelection] = useState([]);

  const [isDeleteAgentModalVisible, setIsDeleteAgentModalVisible] = useState(false);
  const closeDeleteAgentModal = () => setIsDeleteAgentModalVisible(false);
  const showDeleteAgentModal = () => setIsDeleteAgentModalVisible(true);
  const [isRestartAgentModalVisible, setIsRestartAgentModalVisible] = useState(false);
  const closeRestartAgentModal = () => setIsRestartAgentModalVisible(false);
  const showRestartAgentModal = () => setIsRestartAgentModalVisible(true);
  const [loading, setLoading] = useState(false);
  const [errorToast,setErrorToast] = useState(false)

  var globalUrl = window.location.origin;
  // console.log("globalurl", globalUrl);
  // window.location.href=`${globalUrl}/app/wazuh#/health-check`
  // console.log("radio: ", radio)

 function isAdminUser(data: any) {
    // console.log("data: ", data)
    if (data.backend_roles.length > 0) {
      if (data.backend_roles.includes("admin") || data.backend_roles.includes("Wazuh_Admin") ){
        console.log("admin")
      } else {
        setAuthorizationModal(true);
      }
    } else {
      // console.log("inside else")
      setAuthorizationModal(true);
    }
    // console.log("IsAdmin:", isAdmin);
  }


  // const navigate = useNavigate();
  // navigate("")

  useEffect(() => {
    // if (isFirstLoad == true){
    //   location.reload()
    // }
    // setIsFirstLoad(false);
    getTokenSetup();
    setTimeout(()=>{
    checkAuthorization();
    getAgents();
    },1000)
    
  }, [])

  function redirectHome() {
    window.location.replace(`${globalUrl}/app/wazuh#/health-check`);
  }


  type Agent = {
    agentId: string;
    agentName: string;
    agentIp: string;
    agentStatus: string;
    agentOS: string;
    agentGroup: Array<string>;
  };
  const agent: Agent[] = [];

  if (agentData != null || agentData != undefined) {
    for (let i = 0; i < agentData.length; i++) {
      agent.push({
        agentId: agentData[i].id,
        agentName: agentData[i].name,
        agentIp: agentData[i].ip,
        agentStatus: agentData[i].status,
        agentOS: agentData[i].os != null && agentData[i].os.name != null ? agentData[i].os.name : "",
        agentGroup: agentData[i].group
      });
    }
  }
  const columns: Array<EuiBasicTableColumn<Agent>> = [
    {
      field: 'agentId',
      name: 'Agent ID',
      truncateText: true,
      mobileOptions: {
        show: false,
      },
      sortable: true,
    },
    {
      field: 'agentName',
      name: 'Agent Name',
      truncateText: true,
      mobileOptions: {
        show: false,
      },
    },
    {
      field: 'agentIp',
      name: 'Agent IP',
      truncateText: true,
      mobileOptions: {
        show: false,
      },
    },{
      field: 'agentGroup',
      name: 'Agent Group(s)',
      truncateText: true,
      // render: (name:string) => {
      //   <EuiBadge color="hollow">{name}</EuiBadge>
      // },
      mobileOptions: {
        show: false,
      },
    },
    {
      field: 'agentOS',
      name: 'OS',
      truncateText: true,
      mobileOptions: {
        show: false,
      },
      sortable: true,
    },
    {
      field: 'agentStatus',
      name: 'Agent Status',
      truncateText: true,
      render: (online: Agent['agentStatus']) => {
        var color = "danger"
        var label = "disconnected"
        if (online == "active") {
          color = "success"
          label = "active"
        }
        if (online == "active") {
          color = "success"
          label = "active"
        }
        if (online == "never_connected") {
          color = "warning"
          label = "never connected"
        }
        return <EuiHealth color={color}>{label}</EuiHealth>;
      },
      sortable: true,
    },
  ];

  const onTableChange = ({ page }: Criteria<Agent>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };
  const togglePerPageOptions = () => setShowPerPageOptions(!showPerPageOptions);

  // Manually handle pagination of data
  const findAgents = (agents: Agent[], pageIndex: number, pageSize: number) => {
    let pageOfItems;

    if (!pageIndex && !pageSize) {
      pageOfItems = agents;
    } else {
      const startIndex = pageIndex * pageSize;
      pageOfItems = agents.slice(
        startIndex,
        Math.min(startIndex + pageSize, agents.length)
      );
    }

    return {
      pageOfItems,
      totalItemCount: agents.length,
    };
  };

  const { pageOfItems, totalItemCount } = findAgents(agent, pageIndex, pageSize);

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
    pageSizeOptions: [10, 20, 100],
    showPerPageOptions,
  };

  const resultsCount =
    pageSize === 0 ? (
      <strong>All</strong>
    ) : (
      <>
        <strong>
          {pageSize * pageIndex + 1}-{pageSize * pageIndex + pageSize}
        </strong>{' '}
        of {totalItemCount}
      </>
    );

  const agentDetails = (agent) => {
    // console.log("agent selected is: ", agent.agentId)
    setSelectedAgent(agent)
  }

  const actions = useMemo(() => {
    let actions: Array<CustomItemAction<Agent>> = [
      {
        render: (agent: Agent) => {
          return (
            <>
              <EuiToolTip
                position="top"
                content={
                  <p>
                    Restart Agent
                  </p>
                }
              >
                <EuiButtonIcon
                  iconType="refresh"
                  isDisabled={agent.agentStatus != 'active' ? true : false}
                  // color="danger"
                  aria-label="restart"
                  onClick={() => {
                    setIsRestartAgentModalVisible(true)
                    agentDetails(agent);
                  }}>
                </EuiButtonIcon>
              </EuiToolTip>
              <EuiToolTip
                position="top"
                content={
                  <p>
                    Delete Agent
                  </p>
                }
              >
                <EuiButtonIcon
                  iconType="trash"
                  color="danger"
                  aria-label="Delete"
                  onClick={() => {
                    setIsDeleteAgentModalVisible(true)
                    agentDetails(agent);
                  }}>
                </EuiButtonIcon>
              </EuiToolTip>
              <EuiToolTip
                position="top"
                content={
                  <p>
                    Run Commands
                  </p>
                }
              >
                <EuiButtonIcon
                  iconType="arrowRight"
                  isDisabled={agent.agentStatus != 'active' ? true : false}
                  onClick={() => {
                    showModal(), agentDetails(agent);
                    // console.log("os:", agent.agentOS)
                    // console.log("isNonWindows: ", isNonWindows)
                    setIsNonWindows(false)
                    if (agent.agentOS.toLowerCase() != "windows" && !agent.agentOS.toLowerCase().includes("windows")) {
                      // console.log("condition matched")
                      setIsNonWindows(true)
                    }
                  }}>
                </EuiButtonIcon>
              </EuiToolTip>
            </>
          );
        },
      },
    ];
    return actions
  }, [customAction])

  const columnsWithActions = [
    ...columns,
    {
      name: 'Actions',
      actions,
    },
  ];

  const sorting = {
    sort: {
      field: 'agentStatus'!,
      direction: 'asc'!,
    },
  };

  const renderToolsRight = () => {
    return (
      <EuiButton
        key="RefreshAgents"
        onClick={() => {
          getAgents();
        }}
        isDisabled={false}
        iconType="refresh"
      >
        Refresh
      </EuiButton>)
  };

  const renderToolsLeft = () => {
    if (selection.length === 0) {
      return;
    }
    const onClick = () => {
      // store.deleteUsers(...selection.map(user => user.id));
      setSelection([]);
    };

    return (
      <EuiButton color="primary" iconType="play" onClick={onClick}>
        Action on {selection.length} Agent(s)
      </EuiButton>
    );
  }

  const search = {
    toolsLeft: renderToolsLeft(),
    toolsRight: renderToolsRight(),
    box: {
      incremental: true,
      schema: true,
    },
    filters: [
    //   {
    //   type: 'any',
    //   field: 'agentStatus',
    //   values:['active'],
    //   name: 'Active',
    //   negatedName: 'active'!
    // }
      // {
      //   type: 'field_value_selection',
      //   field: 'agentStatus',
      //   name: 'Agent Status',
      //   multiSelect: true,
      //   options: agent.map(agent => ({
      //     value: agent.agentStatus,
      //     name: agent.agentName,
      //     view: `${agent.agentStatus} ${agent.agentName}`,
      //   })),
      // }
    ],
  };

  const selectionValue =(selection:any)=> {
    // selectable: agent => agent.agentStatus,
    // onSelectionChange: selection => 
    setSelection(selection)
  };

  // const onSearchChange = (e) => {
  //   setSearchValue(e.target.value);
  // }

  // const onSelectionChange = (selectedItems) =>{
  //   setSelectedItems(selectedItems);
  // }

  // const hasItems = items.length > 0

const refreshButton = (
  <EuiButton type="primary"
                color="primary"
                size="s"
                iconType="refresh"
                fill={true}
                // isDisabled={agent.agentStatus != 'active' ? true : false}
                onClick={() => { }}>
                <FormattedMessage id="testinvinsense.buttonText" defaultMessage="Refresh" />
              </EuiButton>
)

  const toastError = () => {
    // use this function to handle 401 error in all API calls

    notifications.toasts.addDanger(
      i18n.translate('testinvinsense.dataUpdated', {
        defaultMessage: `Unable to retrieve token, Refresh the page.`,
      }));
  }

  const toastMessage = async (data) => {
    if (data.data.total_affected_items > 0) {
      notifications.toasts.addSuccess(
        i18n.translate('testinvinsense.dataUpdated', {
          defaultMessage: `Action taken: Command was sent to agent(s): ${data.data.affected_items}`,
        })
      );
    }
    else {
      notifications.toasts.addDanger(
        i18n.translate('testinvinsense.dataUpdated', {
          defaultMessage: `Action failed: ${data.message}`,
        }));
    }
  }

  let modal;
  if (isModalVisible) {
    modal = (
      <EuiOverlayMask>
        <EuiModal onClose={closeModal}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiFlexGroup gutterSize="l" wrap>
              <EuiFlexItem grow={false} >
                <img
                  src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiA5NiI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fS5jbHMtMntmaWxsOm5vbmU7fS5jbHMtM3tmaWxsOiMyMjkwMjI7fS5jbHMtNHtmaWxsOiMwYTc1MzM7fS5jbHMtNXtmaWxsOiMwMzA7b3BhY2l0eTowLjU7aXNvbGF0aW9uOmlzb2xhdGU7fS5jbHMtNntmaWxsOiMwY2IwNGE7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5JbnZpbnNlbnNlLWljb24tOTZ4OTY8L3RpdGxlPjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iNDcuNDciIGN5PSI3My4yMyIgcj0iMTcuMzMiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iNDguMDUgMTUuNzcgMzYuMDkgMCA0OC4wNSAxNS44NCA0OC4wNSAxNS43NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMyIgcG9pbnRzPSI0OC4wNSAxNS44NCAzNi4wOSAwIDEzLjMgMCA0OC4wNSA0Ni4yNyA1OS40OCAzMC44NSA0OC4wNSAxNS43NyA0OC4wNSAxNS44NCIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtNCIgcG9pbnRzPSI1OS44MiAwIDQ4LjA1IDE1Ljc3IDU5LjQ4IDMwLjg1IDgyLjcgMCA1OS44MiAwIi8+PHBvbHlnb24gY2xhc3M9ImNscy01IiBwb2ludHM9IjQ5LjkxIDEzLjMxIDQ4LjA1IDE1Ljc3IDU5LjQ4IDMwLjg1IDYxLjY5IDI3Ljk2IDQ5LjkxIDEzLjMxIi8+PHBhdGggY2xhc3M9ImNscy02IiBkPSJNNDguMDUsNjEuNDZhMy44LDMuOCwwLDAsMC0zLjgxLDMuNzlWNjloNy42MlY2NS4yN2EzLjgsMy44LDAsMCwwLTMuNzktMy44MVoiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik00OC4wNSw0Ni4zNEEyNC44MywyNC44MywwLDEsMCw3Mi44OCw3MS4xNywyNC44MywyNC44MywwLDAsMCw0OC4wNSw0Ni4zNFpNNTguODEsODEuNkEyLjgyLDIuODIsMCwwLDEsNTYsODQuMzlINDAuMDhhMi44LDIuOCwwLDAsMS0yLjc5LTIuNzlWNzJhMi44MywyLjgzLDAsMCwxLDIuNzktMi44MWguNDJWNjUuNWE3LjU5LDcuNTksMCwxLDEsMTUuMTcsMHYzLjcyaC40MmEyLjcyLDIuNzIsMCwwLDEsMi44LDIuNjRWNzJaIi8+PHBhdGggY2xhc3M9ImNscy02IiBkPSJNNDUuMzMsNzQuMTRhLjM0LjM0LDAsMCwxLS4wOS0uMjUuNTIuNTIsMCwwLDEsLjI2LS4zNWwxLjYyLTEuMzVhMS44MSwxLjgxLDAsMCwxLC45My0uMzRINDlhLjY0LjY0LDAsMCwxLC40Mi4xOC42LjYsMCwwLDEsLjE4LjQydjguMTNhLjY0LjY0LDAsMCwxLS4xOC40MmMtLjE3LjA5LS4yNi4xOC0uNDIuMThINDcuNzRhLjYyLjYyLDAsMCwxLS42LS42Vjc0LjIzbC0uNzUuNTljLS4wOS4wOS0uMTguMDktLjM0LjA5cy0uMTctLjA5LS4yNi0uMThaIi8+PC9zdmc+"
                  alt="Invinsense"
                  width={"40px"}
                  height={"40px"}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiTitle size="s">
                  <EuiTextAlign textAlign="left">
                    <h1>Invinsense On-demand scan</h1>
                  </EuiTextAlign>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup gutterSize="l">
              <EuiFlexItem>
                <EuiCard
                  // icon={<EuiIcon size="xxl" type="devToolsApp" />}
                  betaBadgeProps={{
                    label: 'Beta',
                    tooltipContent:
                      'This module is not GA. Please help us by reporting any bugs.',
                  }}
                  title=""
                  description={(<>
                    <EuiCard
                      title=""
                      display="transparent"
                      description={
                        (<><EuiText>
                          <EuiTextAlign textAlign="left">
                            <b>Selected Agent ID:</b> {selectedAgent.agentId}
                          </EuiTextAlign>
                          <EuiTextAlign textAlign="left">
                            <b>Selected Agent Name:</b> {selectedAgent.agentName}
                          </EuiTextAlign>
                          <EuiTextAlign textAlign="left">
                            <b>Selected Agent OS:</b> {selectedAgent.agentOS} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <EuiToolTip position="bottom" content="Based on the operating system the agent is installed on, available options may differ.">
                              <EuiIcon type="alert" color='warning' title="" />
                            </EuiToolTip>
                          </EuiTextAlign>
                        </EuiText>
                        </>)} />
                    <EuiHorizontalRule />
                    <EuiSpacer size="s" />
                  </>
                  )}
                  footer={
                    <>
                      <EuiCheckableCard
                        id={htmlIdGenerator()()}
                        label="isolation0"
                        name={radioName}
                        value="isolation0"
                        disabled={isNonWindows}
                        onChange={() => setRadio('isolation0')}
                      />
                      {/* <EuiSpacer size="s" />
                      <EuiCheckableCard
                        id={htmlIdGenerator()()}
                        label="win_route-null"
                        name={radioName}
                        value="win_route-null"
                        disabled={isNonWindows}
                        onChange={() => setRadio('win_route-null')}
                      /> */}
                      <EuiSpacer size="s" />
                      <EuiCheckableCard
                        id={htmlIdGenerator()()}
                        label="Full scan"
                        name={radioName}
                        value="FullScan"
                        disabled={isNonWindows}
                        onChange={() => setRadio('full-scan0')}
                      />
                      <EuiSpacer size="s" />
                      <EuiCheckableCard
                        id={htmlIdGenerator()()}
                        label="Quick scan"
                        name={radioName}
                        value="QuickScan"
                        disabled={isNonWindows}
                        onChange={() => setRadio('quick-scan0')}
                      /></>
                  }
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButton type="primary" size="s" onClick={closeModal}>
              <FormattedMessage id="testinvinsense.buttonText" defaultMessage="Cancel" />
            </EuiButton>
            <EuiButton type="primary" size="s" onClick={async () => {
              var scanRes = await runScan(selectedAgent.agentId, radio)
              closeModal();
              // console.log("scanData: ", scanData)
              toastMessage(scanRes)
            }} fill>
              <FormattedMessage id="testinvinsense.buttonText" defaultMessage="Run" />
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }

  let destroyModal;

  if (isDeleteAgentModalVisible) {
    destroyModal = (
      <EuiConfirmModal
        title="Delete agent"
        onCancel={closeDeleteAgentModal}
        onConfirm={() => {
          showDeleteAgentModal;
          deleteAgent(selectedAgent.agentId);
          closeDeleteAgentModal();
          console.log("is delete visible", isDeleteAgentModalVisible)
          getAgents();
        }}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        buttonColor="danger"
        defaultFocusedButton="confirm"
      >
        <p>Selected agent will be removed from the manager.</p>
      </EuiConfirmModal>
    );
  }

  let restartModal;

  if (isRestartAgentModalVisible) {
    restartModal = (
      <EuiConfirmModal
        title="Restart agent"
        onCancel={closeRestartAgentModal}
        onConfirm={() => {
          showRestartAgentModal;
          restartAgent(selectedAgent.agentId);
          closeRestartAgentModal();
          getAgents();
        }}
        cancelButtonText="Cancel"
        confirmButtonText="Restart"
        buttonColor="primary"
        defaultFocusedButton="confirm"
      >
        <p>Selected Agent will be restarted.</p>
      </EuiConfirmModal>
    );
  }

  let adminModal;

  if (authorizationModal) {
    adminModal = (
      <EuiModal onClose={() => {
        setAuthorizationModal(false);
        redirectToSiem()
      }}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <EuiFlexGroup gutterSize="l" wrap>

              <EuiFlexItem>
                <p>User not allowed</p>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiFlexGroup gutterSize="l" justifyContent="spaceBetween" direction='column' wrap>
            <EuiFlexItem grow={true} >
              <p>Admin role is needed to be able to perform agent actions. Please re-login with admin user to continue.</p>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                color='danger'
                iconType="exit"
                fill={true}
                onClick={() => {
                  setAuthorizationModal(false);
                  redirectToSiem()
                }} >
                <FormattedMessage id="testinvinsense.buttonText" defaultMessage="Exit" />
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalBody>
      </EuiModal>
    );
  }

  // const refreshHome = () => {
  //   console.log("refreshing home...")
  //   fetch(globalUrl + "/api/check-wazuh", { "method": "GET" }).then((response) => { console.log("health check refreshed") })
  // }

  // const getToken = async () => {
  //   await fetch(`${globalUrl}/api/check-stored-api`, {
  //     "credentials": "include",
  //     "headers": {
  //       "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
  //       "Accept": "application/json, text/plain, */*",
  //       "Accept-Language": "en-US,en;q=0.5",
  //       "Content-Type": "application/json",
  //       "osd-xsrf": "kibana"
  //     },
  //     "referrer": `${globalUrl}/app/wazuh`,
  //     "body": "{\"id\":\"default\"}",
  //     "method": "POST",
  //     "mode": "cors"
  //   }).then((response) => { console.log("inside testapi: ", response); return response }).then((responseJson) => { setToken(responseJson["token"]) });
  // }

  const getTokenSetup = async () => {
    await fetch(`${globalUrl}/api/login`, {
      "credentials": "include",
      "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "osd-xsrf": "kibana",
      },
      "referrer": `${globalUrl}/app/wazuh`,
      "body": "{\"idHost\":\"default\",\"force\":false}",
      "method": "POST",
      "mode": "cors"
    }).then((response) => {
      // console.log("setup", response);
      return response.json()
    }).then((responseJson) => {
      // console.log("token: ", responseJson["token"])
      localStorage.setItem('wz-token', responseJson["token"])
    })
  }

  const getAgents = async () => {
    setLoading(true);
    await fetch(globalUrl + "/api/request", {
      "credentials": "include",
      "headers": {
        // "Bearer": token,
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "osd-xsrf": "kibana"
      },
      "referrer": globalUrl + "/app/wazuh",
      // "body": "{\"method\":\"GET\",\"path\":\"/agents\",\"body\":{},\"id\":\"default\"}",
      "body": "{\"method\":\"GET\",\"path\":\"/agents?agents_list=&sort=status&limit=100000\",\"body\":{},\"id\":\"default\"}",
      "method": "POST",
      "mode": "cors"
    }).then((response) => {
      // console.log("response.status: ", response.status)
      setLoading(false);
      if (response.status == 401) {
        toastError()
        console.log("Unable to authorize")
        return
      }
      // if (response.status !== 200) {
      //   console.log("Status not 200 for Agents");
      // }
      return response.json();
    }).then((responseJson) => {
      // console.log("responseJson", responseJson)
      setAgentData(responseJson.data.affected_items);
    })
      .catch((err) => {
        console.log(err.message);
      });
  }
  // const getAvailableCommands = () => {
  //   fetch(globalUrl + "/api/request", {
  //     "credentials": "include",
  //     "headers": {
  //       "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0",
  //       "Accept": "application/json, text/plain, */*",
  //       "Accept-Language": "en-US,en;q=0.5",
  //       "Content-Type": "application/json",
  //       "osd-xsrf": "kibana"
  //     },
  //     "referrer": globalUrl + "/app/wazuh",
  //     // "body": "{\"method\":\"GET\",\"path\":\"/agents\",\"body\":{},\"id\":\"default\"}",
  //     "body": "{\"method\":\"GET\",\"path\":\"/manager/configuration/analysis/active_response\",\"body\":{},\"id\":\"default\"}",
  //     "method": "POST",
  //     "mode": "cors"
  //   }).then((response) => {
  //     return response.json();
  //   }).then((responseJson) => {
  //     if (responseJson.status !== 200) {
  //       console.log("Status not 200 for Commands");
  //     }
  //     console.log("responseJson", responseJson.data.affected_items)
  //     setAvailableCommands(responseJson.data.affected_items);
  //   })
  //     .catch((err) => {
  //       console.log(err.message);
  //     });
  // }

  const runScan = async (agentId, command) => {
    console.log("got values:", agentId, "---", command)
    await fetch(globalUrl + "/api/request", {
      "credentials": "include",
      "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "osd-xsrf": "kibana"
      },
      "referrer": globalUrl + "/app/wazuh",
      // "body": "{\"method\":\"GET\",\"path\":\"/manager/configuration/analysis/command\",\"body\":{\"devTools\":true},\"id\":\"default\"}",
      //     "body": "{\"method\":\"GET\",\"path\":\"/agents/summary/status=active",\"body\":{},\"id\":\"default\"}",
      "body": `{\"method\":\"PUT\",\"path\":\"/active-response?agents_list=${agentId}\",\"body\":{\"arguments\":[\"null\"],\"command\":\"${command}\",\"custom\":false,\"alert\":{\"data\":{}},\"devTools\":true},\"id\":\"default\"}`,
      "method": "POST",
      "mode": "cors"
    }).then((response) => {
      if (response.status == 401) {
        console.log("Unable to authorize")
        toastError()
        // setIsAuthorized(false);
        return response.json();
      } else {
        return response.json();
      }
    }).then((responseJson) => {
      console.log("running command: ", responseJson)
      // setScanData(responseJson);
      toastMessage(responseJson);
    })
      .catch((err) => {
        console.log(err.message);
      });
  }

  const deleteAgent = async (agentId) => {
    console.log("deleting agent: ", agentId)
    await fetch(globalUrl + "/api/request", {
      "credentials": "include",
      "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "osd-xsrf": "kibana"
      },
      "referrer": globalUrl + "/app/wazuh",
      "body": `{\"method\":\"DELETE\",\"path\":\"/agents?pretty=true&older_than=0s&agents_list=${agentId}&status=all\",\"body\":{\"devtools\":true},\"id\":\"default\"}`,
      "method": "POST",
      "mode": "cors"
    }).then((response) => {
      if (response.status == 401) {
        console.log("Unable to authorize")
        toastError()
        // setIsAuthorized(false);
        return response.json();
      } else {
        return response.json();
      }
    }).then((responseJson) => {
      // setScanData(responseJson);
      console.log("deleted: ", responseJson)
      toastMessage(responseJson);
    })
      .catch((err) => {
        console.log(err.message);
      });
  }

  const restartAgent = async (agentId) => {
    console.log("deleting agent: ", agentId)
    await fetch(globalUrl + "/api/request", {
      "credentials": "include",
      "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "osd-xsrf": "kibana"
      },
      "referrer": globalUrl + "/app/wazuh",
      "body": `{\"method\":\"PUT\",\"path\":\"/agents/${agentId}/restart\",\"body\":{\"devTools\":true},\"id\":\"default\"}`,
      "method": "POST",
      "mode": "cors"
    }).then((response) => {
      if (response.status == 401) {
        console.log("Unable to authorize")
        toastError()
        // setIsAuthorized(false);
        return response.json();
      } else {
        return response.json();
      }
    }).then((responseJson) => {
      // setScanData(responseJson);
      console.log("restarted: ", responseJson)
      toastMessage(responseJson);
    })
      .catch((err) => {
        console.log(err.message);
      });
  }

  const checkAuthorization = async () => {
    await fetch(`${globalUrl}/api/console/proxy?path=_plugins%2F_security%2Fapi%2Faccount&method=GET`, {
      "credentials": "include",
      "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "osd-version": "2.6.0",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
      },
      "referrer": `${globalUrl}/app/dev_tools`,
      "method": "POST",
      "mode": "cors"
    }).then((response) => {
      if (response.status == 401) {
        console.log("Unable to authorize")
        // setIsAuthorized(false);
        return response.json();
      } else {
        return response.json();
      }
    }).then((responseJson) => {
      // console.log("isAuthorised: ", responseJson)
      isAdminUser(responseJson)
      // console.log("checking if user is admin: ", isAdmin)
    })
      .catch((err) => {
        console.log(err.message);
      });
  }

  function redirectToSiem() {
    window.location.href = `${globalUrl}`
  }

  function openAndCloseWindow(url) {
    // window.location.href = `${globalUrl}`
    const newWindow = window.open(url);
    setTimeout(() => {
      if (newWindow) {
        // newWindow.location.reload();
      }
    }, 3000)

    setTimeout(() => {
      if (newWindow) {
        // newWindow.close();
        // location.reload();
      }
    }, 10000)
  }
  // }

  return (
    <>{isAuthorized ? <>
      <Router basename={basename}>
        {adminModal}
        <I18nProvider>
          <>
            <navigation.ui.TopNavMenu
              appName={PLUGIN_ID}
              showSearchBar={false}
              useDefaultBehaviors={false} />
            <EuiPage>
              <EuiPageBody component="main">
                <EuiPageHeader>
                  <EuiTitle size="l">
                    <h1>
                      {/* <FormattedMessage
                        id="testinvinsense.helloWorldText"
                        defaultMessage="{name}"
                        // values = {{"invinsense Ondemand scan"}}
                        values={{ name: PLUGIN_NAME }} /> */}
                    </h1>
                  </EuiTitle>
                </EuiPageHeader>
                <EuiPageContent>
                  <EuiPageContentHeader>
                    <EuiFlexGroup gutterSize="l" wrap>
                      <EuiFlexItem grow={false}>
                        <img
                          src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiA5NiI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZmY7fS5jbHMtMntmaWxsOm5vbmU7fS5jbHMtM3tmaWxsOiMyMjkwMjI7fS5jbHMtNHtmaWxsOiMwYTc1MzM7fS5jbHMtNXtmaWxsOiMwMzA7b3BhY2l0eTowLjU7aXNvbGF0aW9uOmlzb2xhdGU7fS5jbHMtNntmaWxsOiMwY2IwNGE7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5JbnZpbnNlbnNlLWljb24tOTZ4OTY8L3RpdGxlPjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iNDcuNDciIGN5PSI3My4yMyIgcj0iMTcuMzMiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iNDguMDUgMTUuNzcgMzYuMDkgMCA0OC4wNSAxNS44NCA0OC4wNSAxNS43NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMyIgcG9pbnRzPSI0OC4wNSAxNS44NCAzNi4wOSAwIDEzLjMgMCA0OC4wNSA0Ni4yNyA1OS40OCAzMC44NSA0OC4wNSAxNS43NyA0OC4wNSAxNS44NCIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtNCIgcG9pbnRzPSI1OS44MiAwIDQ4LjA1IDE1Ljc3IDU5LjQ4IDMwLjg1IDgyLjcgMCA1OS44MiAwIi8+PHBvbHlnb24gY2xhc3M9ImNscy01IiBwb2ludHM9IjQ5LjkxIDEzLjMxIDQ4LjA1IDE1Ljc3IDU5LjQ4IDMwLjg1IDYxLjY5IDI3Ljk2IDQ5LjkxIDEzLjMxIi8+PHBhdGggY2xhc3M9ImNscy02IiBkPSJNNDguMDUsNjEuNDZhMy44LDMuOCwwLDAsMC0zLjgxLDMuNzlWNjloNy42MlY2NS4yN2EzLjgsMy44LDAsMCwwLTMuNzktMy44MVoiLz48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik00OC4wNSw0Ni4zNEEyNC44MywyNC44MywwLDEsMCw3Mi44OCw3MS4xNywyNC44MywyNC44MywwLDAsMCw0OC4wNSw0Ni4zNFpNNTguODEsODEuNkEyLjgyLDIuODIsMCwwLDEsNTYsODQuMzlINDAuMDhhMi44LDIuOCwwLDAsMS0yLjc5LTIuNzlWNzJhMi44MywyLjgzLDAsMCwxLDIuNzktMi44MWguNDJWNjUuNWE3LjU5LDcuNTksMCwxLDEsMTUuMTcsMHYzLjcyaC40MmEyLjcyLDIuNzIsMCwwLDEsMi44LDIuNjRWNzJaIi8+PHBhdGggY2xhc3M9ImNscy02IiBkPSJNNDUuMzMsNzQuMTRhLjM0LjM0LDAsMCwxLS4wOS0uMjUuNTIuNTIsMCwwLDEsLjI2LS4zNWwxLjYyLTEuMzVhMS44MSwxLjgxLDAsMCwxLC45My0uMzRINDlhLjY0LjY0LDAsMCwxLC40Mi4xOC42LjYsMCwwLDEsLjE4LjQydjguMTNhLjY0LjY0LDAsMCwxLS4xOC40MmMtLjE3LjA5LS4yNi4xOC0uNDIuMThINDcuNzRhLjYyLjYyLDAsMCwxLS42LS42Vjc0LjIzbC0uNzUuNTljLS4wOS4wOS0uMTguMDktLjM0LjA5cy0uMTctLjA5LS4yNi0uMThaIi8+PC9zdmc+"
                          alt="Invinsense"
                          width={"40px"}
                          height={"40px"}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <EuiTitle>
                          <h2>
                            <FormattedMessage
                              id="testinvinsense.congratulationsTitle"
                              defaultMessage="Invinsense On-demand Scan" />
                          </h2>
                        </EuiTitle>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiPageContentHeader>
                  <EuiPageContentBody>
                    <EuiText>
                      <p>
                        <FormattedMessage
                          id="testinvinsense.content"
                          defaultMessage="Welcome to Invinsense! Kindly choose an agent and select the desired action to initiate its execution." />
                      </p>
                      <EuiHorizontalRule />
                      <EuiText grow={false}>
                      </EuiText>
                    </EuiText>
                    {modal}
                    {destroyModal}
                    {restartModal}
                    {agent && <>
                      <EuiSpacer size="xl" />
                      <EuiText size="xs">
                        {/* Showing total {agentData.data.total_affected_items} <strong>Agents</strong> */}
                      </EuiText>
                      <EuiSpacer size="s" />
                      <EuiInMemoryTable
                        tableCaption="All available agents"
                        items={agent}
                        columns={columnsWithActions}
                        loading={loading}
                        search={search}
                        pagination={true}
                        // onChange={onTableChange}
                        hasActions={true}
                        sorting={true}
                        // selection={{onSelectionChange:selectionValue}}
                        // isSelectable={true}
                      />
                    </>}
                  </EuiPageContentBody>
                </EuiPageContent>
                <EuiFlexGroup alignItems="center" justifyContent='center' >
                  <EuiFlexItem grow={false}>
                    </EuiFlexItem>
                    <EuiFlexItem grow={6}>         
                    <EuiText color='subdued' size="s">
                      <EuiTextAlign textAlign="center">
                        Invinsense On-demand Scan <small>v</small>1.0.1
                      </EuiTextAlign>
                    </EuiText>
                  </EuiFlexItem>               
                </EuiFlexGroup>
              </EuiPageBody>
            </EuiPage>
          </>
        </I18nProvider>
      </Router>
    </> :
      <>
        <div>
          <EuiFlexGroup alignItems="center" justifyContent="spaceAround">
            <EuiFlexItem grow={true}>
              <EuiText>
                <EuiTextAlign textAlign="center">
                  Session timed out.
                </EuiTextAlign>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center" justifyContent="spaceAround">
            <EuiFlexItem grow={false}>
              <EuiButton type="primary"
                color="primary"
                size="s"
                iconType="refresh"
                fill={true}
                // isDisabled={agent.agentStatus != 'active' ? true : false}
                onClick={() => { openAndCloseWindow(`${globalUrl}/app/wazuh#/health-check`); }}>
                <FormattedMessage id="testinvinsense.buttonText" defaultMessage="Refresh plugin" />
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </>
    }</>
  );
};

