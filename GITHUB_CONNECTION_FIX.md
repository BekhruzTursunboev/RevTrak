# GitHub Connection Issues - Solutions

## Problem
Your network is blocking connections to GitHub (ports 443 and 22 are blocked).

## Solutions (Try in order)

### Option 1: Use a VPN or Mobile Hotspot
1. Connect to a VPN service, or
2. Use your phone's mobile hotspot
3. Then try: `git push`

### Option 2: Configure Proxy (If you have one)
If you're behind a corporate proxy, configure Git:

```powershell
# Set proxy (replace with your proxy details)
git config --global http.proxy http://proxy.company.com:8080
git config --global https.proxy http://proxy.company.com:8080

# If proxy requires authentication
git config --global http.proxy http://username:password@proxy.company.com:8080
git config --global https.proxy http://username:password@proxy.company.com:8080

# To remove proxy later
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### Option 3: Use GitHub Desktop
1. Download GitHub Desktop: https://desktop.github.com/
2. It may handle network issues better than command line

### Option 4: Manual Upload via GitHub Web
1. Go to https://github.com/BekhruzTursunboev/RevTrak
2. Click "Upload files"
3. Drag and drop your changed files
4. Commit directly on GitHub

### Option 5: Use SSH over HTTPS Port (Advanced)
Try configuring SSH to use port 443:

1. Create/edit `~/.ssh/config`:
```
Host github.com
  Hostname ssh.github.com
  Port 443
  User git
```

2. Change remote to SSH:
```powershell
git remote set-url origin git@github.com:BekhruzTursunboev/RevTrak.git
```

3. Try pushing again

### Option 6: Check Windows Firewall
```powershell
# Run as Administrator
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Git*"}
# If Git is blocked, you may need to allow it
```

## Quick Test
After trying any solution, test connection:
```powershell
Test-NetConnection github.com -Port 443
```

If `TcpTestSucceeded : True`, then try `git push` again.

