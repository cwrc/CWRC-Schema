<?php

/*

Oxygen WebHelp Plugin
Copyright (c) 1998-2019 Syncro Soft SRL, Romania.  All rights reserved.

*/

class Template
{
    /**
     * Tempplate file content
     * @var string
     */
    private $template;

    /**
     * Constructor
     * @param string $dir template directory path
     * @param string $lang required language
     * @param string $file template file name
     */
    function __construct($dir, $lang, $file)
    {
        // Use English as default language if the required language is not available
        $filepath = join('/', array(rtrim($dir, '/'), 'en', trim($file, '/')));
        if (is_dir($dir . "/" . $lang)) {
            $filepath = join('/', array(rtrim($dir, '/'), trim($lang, '/'), trim($file, '/')));
        } else {
            $language = explode('-', $lang);
            if (count($language)==2 && is_dir($dir . "/" . $language[0])) {
                $filepath = join('/', array(rtrim($dir, '/'), trim($language[0], '/'), trim($file, '/')));
            }
        }
        $opts = array('http' => array('header' => 'Accept-Charset: UTF-8, *;q=0'));
        $context = stream_context_create($opts);
        $this->template = file_get_contents($filepath, false, $context);
    }

    /**
     * Replace provided value in template
     *
     * @param array $content array containing pairs of value to be replaced => value to preplace with
     * @return string content of the template after replacement
     */
    function replace($content)
    {
        foreach ($content as $key => $val) {
            $this->template = str_replace("#$key#", $val, $this->template);
        }
        return $this->template;
    }

}

?>