import React, { useState } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageSection,
  EuiTitle,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSwitch,
  EuiSpacer,
  EuiSelect,
  EuiButton,
} from '@elastic/eui';

export const SecurityApp = () => {
  const [policyDescription, setPolicyDescription] = useState('');
  const [isSwitchChecked, setIsSwitchChecked] = useState(false);

  const handleFormSubmit = (event) => {
    // Handle form submission logic here
    event.preventDefault();
    console.log('Form submitted:', { policyDescription, isSwitchChecked });
    // Add your logic to save policy settings
  };

  return (
    <EuiPage>
      <EuiPageBody component="div">
        <EuiPageSection>
          <EuiTitle size="l">
            <h1>Policy Settings</h1>
          </EuiTitle>
          <EuiForm component="form" onSubmit={handleFormSubmit}>
            <EuiFormRow label="Policy Description">
              <EuiFieldText
                name="policyDescription"
                value={policyDescription}
                onChange={(e) => setPolicyDescription(e.target.value)}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiFormRow label="Device Control">
              <EuiSwitch
                label="Read"
                checked={isSwitchChecked}
                onChange={() => setIsSwitchChecked(!isSwitchChecked)}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiFormRow label="Protection Configuration">
              <EuiSelect
                options={[
                  { value: 'option1', text: 'Option 1' },
                  { value: 'option2', text: 'Option 2' },
                ]}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiButton type="submit" fill>
              Save Policy
            </EuiButton>
          </EuiForm>
        </EuiPageSection>

        {/* Dashboard Section */}
        <EuiPageSection>
          <EuiTitle size="l">
            <h2>Dashboard</h2>
          </EuiTitle>
          <div>
            {/* Alerts Section */}
            <div>
              <h3>Alerts</h3>
              <p>Display alerts, charts, or other relevant information here.</p>
            </div>

            {/* Statistics Section */}
            <div>
              <h3>Statistics</h3>
              <p>Show statistical data or visualizations here.</p>
            </div>

            {/* Recent Activities Section */}
            <div>
              <h3>Recent Activities</h3>
              <ul>
                <li>User XYZ updated a policy.</li>
                <li>System health check completed.</li>
                {/* Add more recent activities */}
              </ul>
            </div>
          </div>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};
