# GFC-App Wiki Permissions Guide

## Overview
This document outlines the recommended permission settings for the GFC-App Wiki. Proper permission management ensures that the Wiki remains secure, well-maintained, and collaborative.

## Recommended Permission Settings

### Repository Administrators
- Full access to the Wiki
- Ability to change Wiki settings
- Manage collaborator access

### Core Team Members
- Read and write access to all Wiki pages
- Ability to create new pages
- Permission to revert changes

### Regular Contributors
- Read access to all Wiki pages
- Write access to non-critical pages
- Ability to propose changes to critical pages (via pull requests)

### External Contributors
- Read access to all public Wiki pages
- Ability to fork the Wiki and submit pull requests for changes

## Setting Up Permissions

To set up these permissions:

1. Go to the GFC-App repository settings on GitHub.
2. Navigate to the "Manage access" section.
3. For each user or team:
   - Click "Add people" or "Add teams"
   - Search for the user or team name
   - Select the appropriate role (Admin, Write, Read)
   - Click "Add [name] to this repository"

## Wiki-Specific Settings

1. In the repository settings, go to the "Options" tab.
2. Scroll down to the "Features" section.
3. Ensure "Wikis" is enabled.
4. Consider these additional settings:
   - [ ] Restrict editing to collaborators only
   - [ ] Allow all collaborators to edit the wiki

## Best Practices

1. **Regular Audits**: Review Wiki permissions quarterly to ensure they align with current team structures and contributor roles.
2. **Principle of Least Privilege**: Grant the minimum level of access necessary for each role.
3. **Onboarding Process**: Create a clear process for granting and revoking Wiki access as team members join or leave the project.
4. **Documentation**: Keep a log of permission changes and the rationale behind them.

By following these guidelines, we can maintain a secure and collaborative environment for our GFC-App Wiki. Remember to adjust these recommendations as the project grows and evolves.
