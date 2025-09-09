import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeSlash,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save
} from '@phosphor-icons/react';

interface SecuritySettingsProps {
  hasAdminAccess: boolean;
}

export function SecuritySettings({ hasAdminAccess }: SecuritySettingsProps) {
  const [authSettings, setAuthSettings] = useKV('security-auth-settings', {
    requireMfa: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requirePasswordChange: false,
    passwordExpiryDays: 90
  });

  const [accessSettings, setAccessSettings] = useKV('security-access-settings', {
    enableIpWhitelist: false,
    allowedIps: '',
    requireVpn: false,
    blockTor: true,
    enableGeoBlocking: false,
    blockedCountries: '',
    auditLogging: true,
    loginNotifications: true
  });

  const [encryptionSettings, setEncryptionSettings] = useKV('security-encryption-settings', {
    dataEncryption: true,
    transmissionEncryption: true,
    backupEncryption: true,
    encryptionLevel: 'AES-256',
    keyRotationDays: 90,
    sslCertificate: 'Valid',
    hstsEnabled: true
  });

  const handleSaveAuth = () => {
    toast.success('Authentication settings saved successfully');
  };

  const handleSaveAccess = () => {
    toast.success('Access control settings saved successfully');
  };

  const handleSaveEncryption = () => {
    toast.success('Encryption settings saved successfully');
  };

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to modify security settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Security Settings</h3>
          <p className="text-muted-foreground">
            Configure security policies, authentication, and access controls
          </p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Security Score: A+
        </Badge>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Status</CardTitle>
            <Shield className={`h-4 w-4 ${authSettings.requireMfa ? 'text-green-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {authSettings.requireMfa ? 'Enabled' : 'Disabled'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encryption</CardTitle>
            <Lock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encryptionSettings.encryptionLevel}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL Certificate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encryptionSettings.sslCertificate}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="authentication" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
        </TabsList>

        {/* Authentication Settings */}
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="text-blue-500" />
                Authentication & Password Policies
              </CardTitle>
              <CardDescription>
                Configure user authentication requirements and password policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Multi-Factor Authentication */}
              <div className="space-y-4">
                <h4 className="font-medium">Multi-Factor Authentication</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require MFA for all users</Label>
                    <p className="text-sm text-muted-foreground">
                      Force all users to set up and use multi-factor authentication
                    </p>
                  </div>
                  <Switch
                    checked={authSettings.requireMfa}
                    onCheckedChange={(checked) => setAuthSettings(current => ({
                      ...current,
                      requireMfa: checked
                    }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Password Policy */}
              <div className="space-y-4">
                <h4 className="font-medium">Password Policy</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password-min-length">Minimum Length</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      min="6"
                      max="20"
                      value={authSettings.passwordMinLength}
                      onChange={(e) => setAuthSettings(current => ({
                        ...current,
                        passwordMinLength: parseInt(e.target.value) || 8
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input
                      id="password-expiry"
                      type="number"
                      value={authSettings.passwordExpiryDays}
                      onChange={(e) => setAuthSettings(current => ({
                        ...current,
                        passwordExpiryDays: parseInt(e.target.value) || 90
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Require Special Characters</Label>
                    <Switch
                      checked={authSettings.passwordRequireSpecial}
                      onCheckedChange={(checked) => setAuthSettings(current => ({
                        ...current,
                        passwordRequireSpecial: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base">Require Numbers</Label>
                    <Switch
                      checked={authSettings.passwordRequireNumbers}
                      onCheckedChange={(checked) => setAuthSettings(current => ({
                        ...current,
                        passwordRequireNumbers: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base">Require Uppercase Letters</Label>
                    <Switch
                      checked={authSettings.passwordRequireUppercase}
                      onCheckedChange={(checked) => setAuthSettings(current => ({
                        ...current,
                        passwordRequireUppercase: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base">Force Password Change on First Login</Label>
                    <Switch
                      checked={authSettings.requirePasswordChange}
                      onCheckedChange={(checked) => setAuthSettings(current => ({
                        ...current,
                        requirePasswordChange: checked
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Session & Login Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Session & Login Controls</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={authSettings.sessionTimeout}
                      onChange={(e) => setAuthSettings(current => ({
                        ...current,
                        sessionTimeout: parseInt(e.target.value) || 480
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      min="3"
                      max="10"
                      value={authSettings.maxLoginAttempts}
                      onChange={(e) => setAuthSettings(current => ({
                        ...current,
                        maxLoginAttempts: parseInt(e.target.value) || 5
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={authSettings.lockoutDuration}
                    onChange={(e) => setAuthSettings(current => ({
                      ...current,
                      lockoutDuration: parseInt(e.target.value) || 15
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to lock accounts after exceeding max login attempts
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAuth}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Authentication Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Settings */}
        <TabsContent value="access-control">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-green-500" />
                Access Control & Network Security
              </CardTitle>
              <CardDescription>
                Configure IP restrictions, geographic controls, and access monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* IP Whitelisting */}
              <div className="space-y-4">
                <h4 className="font-medium">IP Address Controls</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow access from specified IP addresses
                    </p>
                  </div>
                  <Switch
                    checked={accessSettings.enableIpWhitelist}
                    onCheckedChange={(checked) => setAccessSettings(current => ({
                      ...current,
                      enableIpWhitelist: checked
                    }))}
                  />
                </div>

                {accessSettings.enableIpWhitelist && (
                  <div className="space-y-2">
                    <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                    <Input
                      id="allowed-ips"
                      placeholder="192.168.1.1, 10.0.0.0/8, 172.16.0.0/12"
                      value={accessSettings.allowedIps}
                      onChange={(e) => setAccessSettings(current => ({
                        ...current,
                        allowedIps: e.target.value
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of IP addresses or CIDR ranges
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require VPN Connection</Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow access through corporate VPN
                    </p>
                  </div>
                  <Switch
                    checked={accessSettings.requireVpn}
                    onCheckedChange={(checked) => setAccessSettings(current => ({
                      ...current,
                      requireVpn: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Block Tor Networks</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent access through Tor or other anonymization networks
                    </p>
                  </div>
                  <Switch
                    checked={accessSettings.blockTor}
                    onCheckedChange={(checked) => setAccessSettings(current => ({
                      ...current,
                      blockTor: checked
                    }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Geographic Controls */}
              <div className="space-y-4">
                <h4 className="font-medium">Geographic Access Controls</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Geographic Blocking</Label>
                    <p className="text-sm text-muted-foreground">
                      Block access from specific countries or regions
                    </p>
                  </div>
                  <Switch
                    checked={accessSettings.enableGeoBlocking}
                    onCheckedChange={(checked) => setAccessSettings(current => ({
                      ...current,
                      enableGeoBlocking: checked
                    }))}
                  />
                </div>

                {accessSettings.enableGeoBlocking && (
                  <div className="space-y-2">
                    <Label htmlFor="blocked-countries">Blocked Countries</Label>
                    <Input
                      id="blocked-countries"
                      placeholder="CN, RU, KP (ISO country codes)"
                      value={accessSettings.blockedCountries}
                      onChange={(e) => setAccessSettings(current => ({
                        ...current,
                        blockedCountries: e.target.value
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of ISO country codes
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Monitoring & Logging */}
              <div className="space-y-4">
                <h4 className="font-medium">Security Monitoring</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Log all user activities and system access
                    </p>
                  </div>
                  <Switch
                    checked={accessSettings.auditLogging}
                    onCheckedChange={(checked) => setAccessSettings(current => ({
                      ...current,
                      auditLogging: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications for new device logins
                    </p>
                  </div>
                  <Switch
                    checked={accessSettings.loginNotifications}
                    onCheckedChange={(checked) => setAccessSettings(current => ({
                      ...current,
                      loginNotifications: checked
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAccess}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Access Control Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Encryption Settings */}
        <TabsContent value="encryption">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="text-purple-500" />
                Encryption & Data Protection
              </CardTitle>
              <CardDescription>
                Configure encryption standards and data protection policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Encryption */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Encryption</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Data at Rest Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt all stored data in the database
                    </p>
                  </div>
                  <Switch
                    checked={encryptionSettings.dataEncryption}
                    onCheckedChange={(checked) => setEncryptionSettings(current => ({
                      ...current,
                      dataEncryption: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Data in Transit Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt all data transmitted over networks
                    </p>
                  </div>
                  <Switch
                    checked={encryptionSettings.transmissionEncryption}
                    onCheckedChange={(checked) => setEncryptionSettings(current => ({
                      ...current,
                      transmissionEncryption: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Backup Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt all backup files and archives
                    </p>
                  </div>
                  <Switch
                    checked={encryptionSettings.backupEncryption}
                    onCheckedChange={(checked) => setEncryptionSettings(current => ({
                      ...current,
                      backupEncryption: checked
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption-level">Encryption Standard</Label>
                  <Select
                    value={encryptionSettings.encryptionLevel}
                    onValueChange={(value) => setEncryptionSettings(current => ({
                      ...current,
                      encryptionLevel: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                      <SelectItem value="AES-256">AES-256 (Recommended)</SelectItem>
                      <SelectItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Key Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Key Management</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="key-rotation">Key Rotation Period (days)</Label>
                  <Input
                    id="key-rotation"
                    type="number"
                    min="30"
                    max="365"
                    value={encryptionSettings.keyRotationDays}
                    onChange={(e) => setEncryptionSettings(current => ({
                      ...current,
                      keyRotationDays: parseInt(e.target.value) || 90
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How often encryption keys should be automatically rotated
                  </p>
                </div>

                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">SSL Certificate Status</span>
                  </div>
                  <p className="text-sm text-green-700">
                    SSL certificate is valid and up to date. Expires: March 15, 2025
                  </p>
                </div>
              </div>

              <Separator />

              {/* SSL/TLS Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">SSL/TLS Configuration</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable HSTS (HTTP Strict Transport Security)</Label>
                    <p className="text-sm text-muted-foreground">
                      Force browsers to use HTTPS connections only
                    </p>
                  </div>
                  <Switch
                    checked={encryptionSettings.hstsEnabled}
                    onCheckedChange={(checked) => setEncryptionSettings(current => ({
                      ...current,
                      hstsEnabled: checked
                    }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        A+
                      </Badge>
                      <span className="font-medium">SSL Labs Score</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last checked: Today
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        TLS 1.3
                      </Badge>
                      <span className="font-medium">Protocol Version</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Latest supported version
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Rotate Keys Now
                </Button>
                <Button onClick={handleSaveEncryption}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Encryption Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}