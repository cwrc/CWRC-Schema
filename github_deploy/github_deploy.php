<?php

// interact with GitHub WebHook
// https://jonathanstark.com/blog/deploying-code-automatically-with-github-webhooks

// Init vars
$LOCAL_ROOT         = "/data/opt/cwrc";
$LOCAL_REPO_NAME    = "CWRC-Schema";
$LOCAL_REPO         = "{$LOCAL_ROOT}/{$LOCAL_REPO_NAME}";
$REMOTE_REPO        = "https://github.com/cwrc/CWRC-Schema.git";
$DESIRED_BRANCH     = "master";

if (file_exists($LOCAL_REPO)) {
  // if repo exists then pull down updated
  echo shell_exec("cd {$LOCAL_REPO} && git pull");
}
else {
  // if repo doesn't exist then clone and checkout branch 
  echo shell_exec("cd {$LOCAL_ROOT} && git clone {$REMOTE_REPO} {$LOCAL_REPO_NAME} && cd {$LOCAL_REPO} && git checkout {$DESIRED_BRANCH}");
}


// Delete local repo if it exists
//if (file_exists($LOCAL_REPO)) {
    //shell_exec("rm -rf {$LOCAL_REPO}");
//}

// Clone fresh repo from github using desired local repo name and checkout the desired branch
//echo shell_exec("cd {$LOCAL_ROOT} && git clone {$REMOTE_REPO} {$LOCAL_REPO_NAME} && cd {$LOCAL_REPO} && git checkout {$BRANCH}");

date_default_timezone_set('America/Edmonton');
die("done " . date('Y-m-d h:i:s a', time()) . "\n"  ) ;

?>
