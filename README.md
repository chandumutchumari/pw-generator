You are working inside my GitHub repository:

https://github.com/chandumutchumari/pw-generator

Create or completely rewrite the repository's `README.md` into a polished, professional, recruiter-friendly open-source README.

IMPORTANT:

* First inspect the ENTIRE repository and understand the actual implementation.
* Read `manifest.json`, `background.js`, `panel.html`, `panel.js`, all CSS files, assets, and any other source files that are present.
* Do NOT invent features, technologies, APIs, security properties, or implementation details that are not actually present in the code.
* The README must accurately describe the current project.
* Keep the existing source code unchanged unless absolutely necessary for README-related asset paths.
* Do not expose or reproduce any secrets, credentials, API keys, tokens, cookies, or sensitive information.
* Do not include unnecessary code dumps in the README.

PROJECT CONTEXT:

This is a Chrome browser extension built using Manifest V3.

The project is a locally running password candidate generation utility with a side-panel UI. It can generate candidates from user-defined patterns and provides utilities for viewing, searching, copying, and exporting candidates. It also contains browser form interaction functionality intended only for authorized/local testing and legitimate password-recovery scenarios.

The repository currently includes functionality such as:

* Chrome Manifest V3 architecture
* Side Panel interface
* Password candidate generation
* Prefix / missing-character / suffix based candidate generation
* Multiple character-set modes
* Numbers
* Lowercase letters
* Uppercase letters
* Letters + numbers
* Custom character sets
* Candidate pagination
* Candidate search/filtering
* Copying individual candidates
* Copying candidate pages
* TXT export
* Manual candidate filling
* Configurable CSS selectors for target input elements
* Configurable CSS selector for submit elements
* Configurable delay for automated interactions
* Background service worker
* Chrome scripting API
* Local/browser-side processing

README STRUCTURE:

# 1. Project title

Use a clear title such as:

Password Candidate Generator

Add a concise one-line description underneath.

# 2. Badges

Add useful badges only where appropriate, such as:

* GitHub repository
* License, ONLY if a license actually exists
* JavaScript
* Chrome Extension
* Manifest V3

Do not add a license badge if the repository does not contain a license.

# 3. Overview

Explain:

* What the extension is
* Why it was built
* What problem it solves
* That it runs locally in the browser
* That it is a Chrome Manifest V3 extension

Keep this section professional and concise.

# 4. Features

Create a detailed but readable feature list covering ALL major functionality that actually exists in the source code.

Organize features into categories where useful:

### Candidate Generation

### Candidate Management

### Browser Interaction

### Extension Architecture

### User Interface

Mention the actual implemented functionality, including:

* Pattern-based candidate generation
* Character-set selection
* Prefix/suffix handling
* Pagination
* Search/filter
* Copy
* TXT export
* Manual fill
* Configurable selectors
* Configurable delay
* Side panel
* Background service worker

Do not claim the extension performs password cracking, credential theft, account compromise, or unauthorized penetration testing.

# 5. How It Works

Explain the workflow in simple technical language.

For example:

User defines a known pattern
↓
Extension generates candidate combinations
↓
Candidates are displayed in the side panel
↓
User can search / paginate / copy / export
↓
Authorized users can optionally interact with a specified webpage input

Describe the actual implementation rather than giving a generic explanation.

# 6. Example

Give a SAFE example of candidate generation using a completely fictional/non-sensitive pattern.

Do not use a real person's password, account, email, or credential.

Clearly label the example as fictional.

# 7. Tech Stack

List the technologies actually present in the repository.

At minimum, if confirmed by the code:

* HTML
* CSS
* JavaScript
* Chrome Extension APIs
* Manifest V3

Mention specific Chrome APIs only if they are actually used.

# 8. Project Structure

Inspect the repository and create an accurate project tree.

For example:

```text
pw-generator/
├── manifest.json
├── background.js
├── panel.html
├── panel.js
├── ...
└── README.md
```

Do NOT invent filenames.

For each important file, briefly explain its responsibility.

# 9. Installation

Provide clear steps for installing the extension locally in Google Chrome using Developer Mode:

1. Clone the repository
2. Open `chrome://extensions/`
3. Enable Developer mode
4. Select "Load unpacked"
5. Choose the repository directory
6. Open/use the extension

Mention any actual setup requirements discovered from the repository.

Do not claim the extension is available on the Chrome Web Store unless it actually is.

# 10. Usage

Explain the actual UI workflow step-by-step.

Include:

* Opening the extension
* Configuring candidate generation
* Generating candidates
* Searching/filtering
* Pagination
* Copying
* Exporting
* Manual fill
* Configuring selectors where applicable

Keep instructions aligned with the actual UI labels in the source code.

# 11. Permissions

Create a dedicated section explaining the permissions declared in `manifest.json`.

For every permission and host permission actually present:

* Name it
* Explain why the extension currently requests it
* Explain what it enables

IMPORTANT:
If `<all_urls>` is present, explicitly acknowledge that it is a broad host permission and explain that it should be reviewed/narrowed for production use.

Do not hide or downplay broad permissions.

# 12. Security & Responsible Use

Create a prominent responsible-use section.

Explain that:

* The extension is intended for authorized testing, local environments, and legitimate password-memory recovery.
* Users must only interact with websites/accounts they own or are explicitly authorized to test.
* Automated form interaction can be misused for unauthorized login attempts.
* The repository should not be used to gain unauthorized access.
* Users are responsible for complying with applicable laws, policies, and terms of service.

Do not provide instructions for bypassing authentication, defeating rate limits, evading detection, or compromising accounts.

# 13. Privacy

Describe the privacy model based ONLY on the actual implementation.

If the code confirms that candidate generation happens locally and there is no external network communication for the core functionality, explain that clearly.

Do not claim "100% secure", "completely private", or similar absolute statements.

# 14. Limitations

Be honest about limitations discovered from the code.

Possible areas to inspect:

* Browser compatibility
* Large candidate spaces
* SPA behavior
* Form detection
* False success detection
* Permission scope
* UI limitations

Only mention limitations that are actually relevant.

# 15. Security Considerations / Future Improvements

Suggest responsible future improvements such as:

* Narrowing host permissions
* Optional permissions
* Explicit confirmation before automated interactions
* Additional safeguards
* Better SPA handling
* Improved success detection
* Improved UI feedback

Clearly label these as future improvements, not existing functionality.

# 16. Development

Explain how another developer can inspect or modify the extension.

Include any relevant development notes found in the repository.

# 17. Contributing

Add a simple contribution section encouraging:

* Bug reports
* Feature suggestions
* Pull requests
* Security-conscious improvements

Do not promise response times.

# 18. License

Inspect whether a LICENSE file exists.

If it exists, describe it accurately.

If there is no license:

* Do NOT invent one.
* State that no license has currently been specified, if appropriate.

# 19. Author

Add:

Chandrasekhar Reddy Mutchumari

GitHub:
https://github.com/chandumutchumari

Only include other social links if they are actually available in the repository or explicitly provided.

# 20. Final README quality requirements

The final README should:

* Look professional on GitHub
* Be easy for students and recruiters to understand
* Be technically accurate
* Have clean Markdown formatting
* Use headings, tables, bullets, and code blocks where useful
* Avoid excessive emojis
* Avoid exaggerated marketing claims
* Avoid calling the project a "password cracker"
* Clearly distinguish existing functionality from future improvements
* Clearly explain responsible use
* Never expose secrets
* Never include real credentials

Before finishing:

1. Compare the README against the actual source code.
2. Remove every claim that cannot be verified from the repository.
3. Make sure all filenames and commands are correct.
4. Make sure permission descriptions match `manifest.json`.
5. Make sure installation instructions work for the current project.
6. Make sure the README is ready to be committed directly to GitHub.

After updating README.md, give me a concise summary of:

* What you changed
* Which files you inspected
* Any discrepancies between the README and implementation
* Any security/privacy issues you noticed that should be addressed before public release

Do not modify application functionality as part of this task unless required to fix a broken README reference.
