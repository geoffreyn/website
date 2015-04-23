% Imports amazon review data, removes formatting, returns reviews
% structure, and unique words as wordblob
%
% Author: Geoffrey Newman
% Date: 4/23/2015

function [reviews, wordblob] = import_data(textfile, entryLimit)

    fid = fopen(textfile);
    count = 1;
    reviews = [];
    wordblob = [];
    
    while count < entryLimit
        tline = fgetl(fid);
        while strcmp(tline,'');
            tline = fgetl(fid);
        end
        if ~ischar(tline), break, end
        colonPos = strfind(tline,':');
        if colonPos == -1, break, end
        catagory = strfind(tline,'/');
        words = strrep(tline(colonPos+2:end),'''','');
        if strcmp(tline(catagory+1:colonPos-1),'text')
            indiwords = unique(regexp([lower(words) '.'], '[\s\.,;:-''"?!/()]+', 'split'));
            wordblob = unique([wordblob, indiwords]);
        end
        eval(['reviews(' num2str(count) ').' tline(catagory+1:colonPos-1) '= ''' words ''';' ]);
        if count == 15
            keyboard
        end
        if mod(count,20000) == 0
            if strcmp(tline(catagory+1:colonPos-1),'text')
                fprintf('logs loaded: %d, ', count);
            end
        end
        if strcmp(tline(catagory+1:colonPos-1),'text')
            count = count + 1;
            tline = fgetl(fid);
        end
    end
    fclose(fid);
end