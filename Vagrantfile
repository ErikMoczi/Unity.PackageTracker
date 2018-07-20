Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder ".", "/vagrant", type: "virtualbox", fsnotify: true, nfs: true
  config.vm.network "private_network", ip: "192.168.50.50"

  config.vm.network "forwarded_port", guest: 3000, host: 8080
  config.vm.network "forwarded_port", guest: 5858, host: 5858

  config.vm.hostname = "NodeJs-Testing"
  config.vm.provider :virtualbox do |vb|
    vb.name = "NodeJs Testing"
    vb.customize ['modifyvm', :id, '--memory', '1024']
    vb.customize ['modifyvm', :id, '--cpus', '2']
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end

  config.vm.provision :shell, :path => "install.sh", privileged: false
  
end
